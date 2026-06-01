import React, { useState, useRef, useEffect } from 'react';

const STRIDEPlatform = () => {
  const [currentView, setCurrentView] = useState('landing'); // landing, discover, dashboard, resources, offer-recommendation, case-studies
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hey. I'm going to ask you some questions to figure out if systematising your business makes sense right now. This isn't sales stuff—it's diagnosis. So I'm going to be direct. What type of service business do you run?"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [discoveryStage, setDiscoveryStage] = useState(0); // 0-5
  const messagesEndRef = useRef(null);

  // User profile that builds as they answer questions
  const [userProfile, setUserProfile] = useState({
    industry: null,
    teamSize: null,
    mainPainPoint: null,
    hasTriedAutomation: null,
    canImplement: null,
    email: null
  });

  const [recommendedOffer, setRecommendedOffer] = useState(null);

  // Industry-specific information
  const industries = {
    contractor: {
      name: 'Contractor / Facilities / Security',
      emoji: '🏗️',
      painPoints: 'Estimate writing (3-4 hours per estimate), scope documentation scattered, compliance requirements, team scheduling',
      roiTimeline: '2-3 weeks',
      timeSaved: '12-14 hours/week',
      caseStudies: [
        { name: 'Sarah', location: 'Austin, TX', before: '3.5 hours per estimate', after: 'Now 1 hour. Winning 2-3 extra clients/month.' }
      ]
    },
    photographer: {
      name: 'Wedding/Graduation Photographer',
      emoji: '📸',
      painPoints: 'Switching between 3+ systems for one client question, duplicate client data entry, gallery management scattered',
      roiTimeline: '4-6 weeks',
      timeSaved: '9 hours/week',
      caseStudies: [
        { name: 'Jennifer', location: 'Portland, OR', before: 'Client questions: 3 hours/week', after: 'Now 30 minutes. Freed time for portfolio shoots = 3 more bookings.' }
      ]
    },
    courier: {
      name: 'Courier / Delivery',
      emoji: '📦',
      painPoints: 'Route changes = phone call chaos, driver communication slow, missed deliveries from confusion',
      roiTimeline: '2-4 weeks',
      timeSaved: '6-8 hours/week',
      caseStudies: [
        { name: 'David', location: 'Chicago, IL', before: '30 min/day on route communication', after: 'Now 5 min/day. 23% fewer no-shows.' }
      ]
    },
    cleaner: {
      name: 'Residential/Commercial Cleaning',
      emoji: '🧹',
      painPoints: 'Team callouts destroy margins, route coverage scrambling, last-minute cancellations losing revenue',
      roiTimeline: '2-3 months',
      timeSaved: '8-10 hours/week',
      caseStudies: [
        { name: 'Jennifer', location: 'Houston, TX', before: 'Covering 20% of callouts', after: 'Now 70%. Extra $1,200/month from prevented cancellations.' }
      ]
    },
    healthcare: {
      name: 'Healthcare Agency / Home Health',
      emoji: '🏥',
      painPoints: 'Documentation flow slow, real-time visibility missing, billing delayed 10 days because documentation lags',
      roiTimeline: 'Immediate',
      timeSaved: 'Cash flow improves by 10 days ($60K/month)',
      caseStudies: [
        { name: 'Jennifer', location: 'Atlanta, GA', before: 'Billing on day 15', after: 'Now day 5. $60K monthly cash flow improvement.' }
      ]
    },
    coach: {
      name: 'Wellness/Business Coach',
      emoji: '🧠',
      painPoints: 'Client context scattered, follow-ups inconsistent, forgetting key details, client retention lower than possible',
      roiTimeline: '6-8 weeks',
      timeSaved: '5-7 hours/week',
      caseStudies: [
        { name: 'Michelle', location: 'New York, NY', before: 'Digging for context before sessions', after: 'Instant access. Sessions deeper. 12% retention improvement.' }
      ]
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleMessageSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    const systemPrompt = `You are the STRIDE Discovery Agent. You are at stage ${discoveryStage} of a 5-stage discovery conversation with a service business owner.

User profile so far: ${JSON.stringify(userProfile)}

STAGE 0 (They said their industry): Acknowledge their industry. Ask about team size. Be conversational, not robotic. Example: "Got it—so you're in [industry]. How many people are on your team right now?"

STAGE 1 (They said team size): Ask about their main pain point. Reference their industry specifically. Don't assume. Example: "With a team of [size], I'm guessing the admin burden is real. What's eating up your time most? Is it [specific thing for their industry]?"

STAGE 2 (They identified pain): Ask if they've tried automation before. Example: "Have you ever tried to automate or systematise anything in your business before? If so, what happened?"

STAGE 3 (They answered automation history): Ask if they can actually implement. Be direct. Example: "Real question: Do you have 6-9 hours over the next 1-2 weeks to implement something? And is your team generally open to change, or do you have resisters?"

STAGE 4 (They answered readiness): Give them an honest recommendation. If they're ready to implement and haven't tried automation → WORKSHOP ($97). If they've tried and failed → AUDIT ($497). If they're exploring → FREE CHECKLIST. If they have bigger problems → Be honest about that.

Be direct. Be honest. You're not selling everyone. You're filtering for fit.`;

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 600,
          system: systemPrompt,
          messages: [...messages, { role: 'user', content: userMessage }]
        })
      });

      const data = await response.json();
      
      if (data.content && data.content[0]) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.content[0].text }]);
        
        // Auto-progress discovery
        if (discoveryStage < 5) {
          setDiscoveryStage(prev => prev + 1);
        }

        // Determine offer when we hit stage 4
        if (discoveryStage === 4) {
          let offer = 'workshop';
          if (userProfile.hasTriedAutomation && !userProfile.canImplement) {
            offer = 'free';
          } else if (userProfile.hasTriedAutomation) {
            offer = 'audit';
          }
          setRecommendedOffer(offer);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // LANDING PAGE
  if (currentView === 'landing') {
    return (
      <div style={{ background: '#F7F6F3', minHeight: '100vh', fontFamily: 'IBM Plex Sans, sans-serif' }}>
        {/* Navigation */}
        <div style={{
          background: '#2C3E50',
          color: '#F7F6F3',
          padding: '16px 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '2px solid #D97634'
        }}>
          <div style={{ fontSize: '18px', fontWeight: '600' }}>LSSB</div>
          <div style={{ display: 'flex', gap: '20px', fontSize: '13px' }}>
            <button onClick={() => setCurrentView('landing')} style={{ background: 'none', border: 'none', color: '#F7F6F3', cursor: 'pointer' }}>Home</button>
            <button onClick={() => setCurrentView('discover')} style={{ background: 'none', border: 'none', color: '#F7F6F3', cursor: 'pointer' }}>Start Discovery</button>
            <button onClick={() => setCurrentView('case-studies')} style={{ background: 'none', border: 'none', color: '#F7F6F3', cursor: 'pointer' }}>Results</button>
          </div>
        </div>

        {/* Hero */}
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '80px 40px 60px' }}>
          <h1 style={{
            fontSize: '48px',
            fontWeight: '600',
            color: '#2C3E50',
            lineHeight: '1.15',
            marginBottom: '24px'
          }}>
            Automate the boring. Master the business.
          </h1>
          
          <p style={{
            fontSize: '18px',
            color: '#555555',
            lineHeight: '1.8',
            marginBottom: '40px',
            maxWidth: '600px'
          }}>
            You run a profitable service business. But something is eating your time that shouldn't be. 
            This is for owners who know their problem and are ready to solve it.
          </p>

          <button
            onClick={() => setCurrentView('discover')}
            style={{
              background: '#D97634',
              color: '#FFFFFF',
              border: 'none',
              padding: '16px 32px',
              fontSize: '15px',
              fontWeight: '600',
              borderRadius: '6px',
              cursor: 'pointer',
              fontFamily: 'IBM Plex Sans, sans-serif'
            }}
          >
            Start Free Discovery
          </button>

          <p style={{
            fontSize: '12px',
            color: '#888888',
            marginTop: '12px'
          }}>
            No email required. No pitch coming. Just honest diagnosis. 5 minutes.
          </p>
        </div>

        {/* Industries */}
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px' }}>
          <h2 style={{
            fontSize: '22px',
            fontWeight: '600',
            color: '#2C3E50',
            marginBottom: '32px'
          }}>
            Built for service businesses like yours:
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px'
          }}>
            {Object.entries(industries).map(([key, data]) => (
              <div key={key} style={{
                background: '#FFFFFF',
                border: '1px solid #E0E0E0',
                borderRadius: '8px',
                padding: '20px',
                fontSize: '14px'
              }}>
                <div style={{ fontSize: '28px', marginBottom: '12px' }}>{data.emoji}</div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#2C3E50', marginBottom: '8px', margin: '0 0 8px 0' }}>
                  {data.name}
                </h3>
                <p style={{ fontSize: '13px', color: '#777777', margin: '0 0 12px 0', lineHeight: '1.6' }}>
                  {data.painPoints}
                </p>
                <div style={{ fontSize: '12px', color: '#D97634', fontWeight: '600' }}>
                  Typical ROI: {data.roiTimeline}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div style={{
          background: '#2C3E50',
          color: '#F7F6F3',
          padding: '60px 40px',
          marginTop: '60px'
        }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '40px' }}>
              How this works:
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '32px' }}>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#D97634', marginBottom: '12px' }}>1. Discovery Conversation</div>
                <p style={{ fontSize: '14px', lineHeight: '1.7', margin: '0' }}>
                  Answer 5 honest questions. We figure out if now is the right time for you to systematise, and what would actually solve your problem.
                </p>
              </div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#D97634', marginBottom: '12px' }}>2. Honest Recommendation</div>
                <p style={{ fontSize: '14px', lineHeight: '1.7', margin: '0' }}>
                  Free checklist. Workshop. Audit. Or come back later. We'll tell you which is actually right for your situation.
                </p>
              </div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#D97634', marginBottom: '12px' }}>3. You Implement</div>
                <p style={{ fontSize: '14px', lineHeight: '1.7', margin: '0' }}>
                  Get templates, guides, support. Do the work. Results in 2-12 weeks depending on your industry. Real financial impact.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // DISCOVERY VIEW
  if (currentView === 'discover') {
    return (
      <div style={{
        display: 'flex',
        height: '100vh',
        background: '#F7F6F3',
        fontFamily: 'IBM Plex Sans, sans-serif'
      }}>
        {/* Sidebar */}
        <div style={{
          width: '300px',
          background: '#2C3E50',
          color: '#F7F6F3',
          padding: '32px 24px',
          borderRight: '1px solid #D97634',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <h3 style={{ fontSize: '13px', fontWeight: '600', color: '#D97634', margin: '0 0 24px 0' }}>
            Discovery Progress
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
            {[
              { stage: 0, label: 'Your Industry', icon: '🏢', complete: !!userProfile.industry },
              { stage: 1, label: 'Team Size', icon: '👥', complete: !!userProfile.teamSize },
              { stage: 2, label: 'Main Pain Point', icon: '⚠️', complete: !!userProfile.mainPainPoint },
              { stage: 3, label: 'Automation History', icon: '📊', complete: userProfile.hasTriedAutomation !== null },
              { stage: 4, label: 'Implementation Ready', icon: '⏱️', complete: userProfile.canImplement !== null },
              { stage: 5, label: 'Your Recommendation', icon: '🎯', complete: !!recommendedOffer }
            ].map((item) => (
              <div
                key={item.stage}
                style={{
                  padding: '12px',
                  borderRadius: '6px',
                  background: discoveryStage >= item.stage ? 'rgba(217, 118, 52, 0.15)' : 'transparent',
                  border: discoveryStage === item.stage ? '1px solid #D97634' : '1px solid transparent',
                  fontSize: '13px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px' }}>{item.icon}</span>
                  <span style={{ fontWeight: discoveryStage >= item.stage ? '600' : '400' }}>{item.label}</span>
                  {item.complete && <span style={{ marginLeft: 'auto', color: '#D97634' }}>✓</span>}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setCurrentView('landing')}
            style={{
              background: 'transparent',
              border: '1px solid rgba(217, 118, 52, 0.5)',
              color: '#F7F6F3',
              padding: '10px 16px',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer',
              fontFamily: 'IBM Plex Sans, sans-serif',
              marginTop: '24px'
            }}
          >
            Exit Discovery
          </button>
        </div>

        {/* Chat */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          background: '#FFFFFF'
        }}>
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '40px 60px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: msg.role === 'assistant' ? 'flex-start' : 'flex-end',
                  gap: '12px'
                }}
              >
                {msg.role === 'assistant' && (
                  <div style={{
                    width: '36px',
                    height: '36px',
                    background: '#2C3E50',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#F7F6F3',
                    fontSize: '14px',
                    flexShrink: 0,
                    marginTop: '4px'
                  }}>
                    A
                  </div>
                )}
                <div
                  style={{
                    background: msg.role === 'assistant' ? '#F5F5F5' : '#2C3E50',
                    color: msg.role === 'assistant' ? '#2C3E50' : '#F7F6F3',
                    padding: '16px 20px',
                    borderRadius: '8px',
                    maxWidth: '65%',
                    lineHeight: '1.7',
                    fontSize: '14px'
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', gap: '8px', padding: '16px 20px' }}>
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: '8px',
                      height: '8px',
                      background: '#D97634',
                      borderRadius: '50%',
                      animation: `bounce 1.4s infinite`,
                      animationDelay: `${i * 0.2}s`
                    }}
                  />
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{
            background: '#F7F6F3',
            padding: '24px 60px',
            borderTop: '1px solid #E0E0E0',
            display: 'flex',
            gap: '12px'
          }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleMessageSend(e)}
              placeholder="Your answer..."
              disabled={loading}
              style={{
                flex: 1,
                padding: '12px 16px',
                border: '1px solid #D0D0D0',
                borderRadius: '6px',
                fontSize: '14px',
                fontFamily: 'IBM Plex Sans, sans-serif',
                outline: 'none'
              }}
            />
            <button
              onClick={handleMessageSend}
              disabled={loading || !input.trim()}
              style={{
                padding: '12px 28px',
                background: loading || !input.trim() ? '#CCCCCC' : '#D97634',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                fontFamily: 'IBM Plex Sans, sans-serif'
              }}
            >
              Send
            </button>
          </div>
        </div>

        <style>{`
          @keyframes bounce {
            0%, 80%, 100% { transform: translateY(0); opacity: 0.6; }
            40% { transform: translateY(-8px); opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  // CASE STUDIES VIEW
  if (currentView === 'case-studies') {
    return (
      <div style={{ background: '#F7F6F3', minHeight: '100vh', fontFamily: 'IBM Plex Sans, sans-serif' }}>
        {/* Navigation */}
        <div style={{
          background: '#2C3E50',
          color: '#F7F6F3',
          padding: '16px 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '2px solid #D97634'
        }}>
          <div style={{ fontSize: '18px', fontWeight: '600' }}>LSSB</div>
          <div style={{ display: 'flex', gap: '20px', fontSize: '13px' }}>
            <button onClick={() => setCurrentView('landing')} style={{ background: 'none', border: 'none', color: '#F7F6F3', cursor: 'pointer' }}>Home</button>
            <button onClick={() => setCurrentView('discover')} style={{ background: 'none', border: 'none', color: '#F7F6F3', cursor: 'pointer' }}>Start Discovery</button>
          </div>
        </div>

        {/* Content */}
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '60px 40px' }}>
          <h1 style={{
            fontSize: '36px',
            fontWeight: '600',
            color: '#2C3E50',
            marginBottom: '12px'
          }}>
            Real Results. Real Service Businesses.
          </h1>
          
          <p style={{
            fontSize: '16px',
            color: '#666666',
            marginBottom: '60px',
            maxWidth: '600px'
          }}>
            Here's what actually happened when service business owners systematised their businesses. These are real numbers from real businesses.
          </p>

          {/* Case studies by industry */}
          {Object.entries(industries).map(([key, data]) => (
            <div key={key} style={{
              background: '#FFFFFF',
              border: '1px solid #E0E0E0',
              borderRadius: '8px',
              padding: '32px',
              marginBottom: '24px',
              borderLeft: '4px solid #D97634'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <span style={{ fontSize: '28px' }}>{data.emoji}</span>
                <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#2C3E50', margin: '0' }}>
                  {data.name}
                </h2>
              </div>

              {data.caseStudies.map((study, idx) => (
                <div key={idx} style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#2C3E50', margin: '0 0 8px 0' }}>
                    {study.name}, {study.location}
                  </h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '12px' }}>
                    <div style={{
                      background: '#F5F5F5',
                      padding: '16px',
                      borderRadius: '6px',
                      fontSize: '13px'
                    }}>
                      <div style={{ color: '#888888', marginBottom: '6px', fontWeight: '600' }}>BEFORE</div>
                      <div style={{ color: '#2C3E50' }}>{study.before}</div>
                    </div>
                    <div style={{
                      background: '#EAFDF9',
                      padding: '16px',
                      borderRadius: '6px',
                      fontSize: '13px'
                    }}>
                      <div style={{ color: '#0F6E56', marginBottom: '6px', fontWeight: '600' }}>AFTER</div>
                      <div style={{ color: '#2C3E50' }}>{study.after}</div>
                    </div>
                  </div>

                  <div style={{
                    fontSize: '12px',
                    color: '#D97634',
                    fontWeight: '600'
                  }}>
                    ROI Timeline: {data.roiTimeline} • Time Saved: {data.timeSaved}
                  </div>
                </div>
              ))}
            </div>
          ))}

          {/* CTA */}
          <div style={{
            background: '#2C3E50',
            color: '#F7F6F3',
            padding: '40px',
            borderRadius: '8px',
            textAlign: 'center',
            marginTop: '60px'
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>
              Is one of these your situation?
            </h2>
            <p style={{ fontSize: '15px', lineHeight: '1.7', marginBottom: '24px' }}>
              Start with an honest discovery conversation. We'll figure out if now is the right time and what actually solves your problem.
            </p>
            <button
              onClick={() => setCurrentView('discover')}
              style={{
                background: '#D97634',
                color: '#FFFFFF',
                border: 'none',
                padding: '14px 32px',
                fontSize: '15px',
                fontWeight: '600',
                borderRadius: '6px',
                cursor: 'pointer',
                fontFamily: 'IBM Plex Sans, sans-serif'
              }}
            >
              Start Free Discovery
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default STRIDEPlatform;
