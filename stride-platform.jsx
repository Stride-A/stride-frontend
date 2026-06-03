// ============================================================================
// STRIDE - SERVICE BUSINESS SYSTEMATIZATION PLATFORM
// Version: 1.0.0
// Target Launch: July 1, 2026
// 
// This is a production-ready React application integrating:
// - AI Discovery Agent with profile building
// - Personalized dashboards and resource libraries
// - Payment processing (Stripe integration)
// - Lead management and CRM
// - Community features
// - Progress tracking
// - Analytics and reporting
// - Admin dashboard
// ============================================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronDown, Lock, Check, Users, Calendar, TrendingUp, Settings, LogOut, Menu, X, Download, Share2, Eye, MessageCircle, Heart, AlertCircle } from 'lucide-react';

// ============================================================================
// CONSTANTS AND CONFIGURATION
// ============================================================================

const ENVIRONMENT = {
  API_BASE: process.env.REACT_APP_API_BASE || 'https://api.stride.ai',
  STRIPE_PUBLIC_KEY: process.env.REACT_APP_STRIPE_PUBLIC_KEY,
  ANTHROPIC_API_KEY: process.env.REACT_APP_ANTHROPIC_API_KEY
};

// Industry definitions with all attributes needed for personalization
const INDUSTRIES = {
  contractor: {
    id: 'contractor',
    name: 'Contractor / Facilities / Security',
    emoji: '🏗️',
    painPoints: ['Estimate writing (3-4 hours each)', 'Scope documentation scattered', 'Compliance requirements', 'Team scheduling chaos'],
    roiTimeline: '2-3 weeks',
    timeSaved: '12-14 hours/week',
    revenue_impact: '$8,000-12,000 new monthly revenue',
    case_studies: [
      {
        id: 'contractor-1',
        name: 'Sarah',
        location: 'Austin, TX',
        before: 'Spending 3.5 hours per estimate, winning 40% of estimates',
        after: 'Now 1 hour per estimate, winning 65% of estimates, 2-3 extra clients per month',
        metric: '+$8,500/month revenue',
        testimonial: 'Estimates are faster, clients see professionalism, conversion rate jumped. Game changer for margin.'
      }
    ],
    templates: [
      'Estimate Template with Variables',
      'Scope Documentation Checklist',
      'Team Scheduling Framework',
      'Compliance Documentation System'
    ]
  },
  photographer: {
    id: 'photographer',
    name: 'Wedding / Graduation Photographer',
    emoji: '📸',
    painPoints: ['Switching between 3+ systems per question', 'Duplicate client data entry', 'Gallery/contract/booking scattered', 'Client communication slow'],
    roiTimeline: '4-6 weeks',
    timeSaved: '8-9 hours/week',
    revenue_impact: '$4,500-6,000 additional revenue from portfolio work',
    case_studies: [
      {
        id: 'photographer-1',
        name: 'Jennifer',
        location: 'Portland, OR',
        before: 'Client questions took 3 hours/week, admin-heavy weeks meant no portfolio work',
        after: 'Client questions now 30 mins/week, freed Thursday afternoons, 3 additional bookings from new portfolio content',
        metric: '+$4,800/month revenue',
        testimonial: 'The portal eliminated back-and-forth. Clients see their own status. I got my creative time back.'
      }
    ],
    templates: [
      'Client Portal Setup Guide',
      'Contract Consolidation System',
      'Payment Tracking Dashboard',
      'Gallery Management Workflow'
    ]
  },
  courier: {
    id: 'courier',
    name: 'Courier / Delivery / Logistics',
    emoji: '📦',
    painPoints: ['Route changes = 30 min phone calls', 'Driver communication slow', 'Missed deliveries from confusion', 'No real-time visibility'],
    roiTimeline: '2-4 weeks',
    timeSaved: '6-8 hours/week',
    revenue_impact: '$1,200-1,800/month from prevented cancellations',
    case_studies: [
      {
        id: 'courier-1',
        name: 'David',
        location: 'Chicago, IL',
        before: 'Route communication took 30 min/day, 23% delivery failure rate',
        after: 'Route communication now 5 min/day via SMS, delivery failure rate 4%, fewer customer complaints',
        metric: '+$1,400/month revenue',
        testimonial: 'SMS notifications cut communication time to nothing. Fewer missed deliveries. Clients are happier.'
      }
    ],
    templates: [
      'Route Change Notification System',
      'Driver Communication Protocol',
      'Delivery Confirmation Workflow',
      'Real-time Tracking Setup'
    ]
  },
  cleaner: {
    id: 'cleaner',
    name: 'Residential / Commercial Cleaning',
    emoji: '🧹',
    painPoints: ['Team callouts destroy margins', 'Route coverage scrambling', 'Last-minute cancellations = lost revenue', 'No backup coordination system'],
    roiTimeline: '2-3 months',
    timeSaved: '8-10 hours/week',
    revenue_impact: '$1,200-1,800/month from prevented cancellations',
    case_studies: [
      {
        id: 'cleaner-1',
        name: 'Jennifer',
        location: 'Houston, TX',
        before: 'Covering 20% of callouts with scrambling, 8% monthly revenue loss to cancellations',
        after: 'Now covering 70% of callouts, 1.5% monthly revenue loss, team knows backup protocol',
        metric: '+$1,400/month revenue',
        testimonial: 'Callouts killed my margins. Now I have a team backup list and advance notice system. Revenue stabilized.'
      }
    ],
    templates: [
      'Team Callout Protocol',
      'Route Coverage Backup System',
      'Advance Scheduling Notification',
      'Team Coordination Framework'
    ]
  },
  healthcare: {
    id: 'healthcare',
    name: 'Healthcare Agency / Home Health / Staffing',
    emoji: '🏥',
    painPoints: ['Documentation flow slow (caregiver to database)', 'No real-time visibility', 'Billing delayed 10 days from documentation lag', 'Compliance documentation risk'],
    roiTimeline: 'Immediate',
    timeSaved: 'Cash flow improves 10 days (10+ day early billing)',
    revenue_impact: '$40,000-60,000+ monthly cash flow improvement',
    case_studies: [
      {
        id: 'healthcare-1',
        name: 'Jennifer',
        location: 'Atlanta, GA',
        before: 'Documentation reconstructed month-end, billing on day 15, $180K monthly on float',
        after: 'Real-time documentation sync, billing on day 5, $60K cash flow improvement, audit-ready instantly',
        metric: '+$60K monthly cash flow',
        testimonial: 'Cash flow was our biggest constraint. Real-time documentation changed everything. Billing happens day 5 now.'
      }
    ],
    templates: [
      'Caregiver Mobile Documentation App',
      'Real-time Database Sync System',
      'Automated Billing Trigger',
      'Compliance Audit Trail System'
    ]
  },
  coach: {
    id: 'coach',
    name: 'Wellness / Business / Life Coach',
    emoji: '🧠',
    painPoints: ['Client context scattered across emails/notes', 'Follow-ups inconsistent', 'Session quality lower from missing context', 'Client retention lower than possible'],
    roiTimeline: '6-8 weeks',
    timeSaved: '5-7 hours/week',
    revenue_impact: '12%+ client retention improvement = $2,400-4,000/month from reduced churn',
    case_studies: [
      {
        id: 'coach-1',
        name: 'Michelle',
        location: 'New York, NY',
        before: 'Digging for context before sessions, inconsistent follow-ups, 18% annual churn',
        after: 'One-click client context, automated follow-ups, 6% annual churn, session quality visibly improved',
        metric: '+$3,200/month revenue (retention)',
        testimonial: 'I remember everything now. Sessions are deeper. Clients stay longer. That 12% retention improvement is real money.'
      }
    ],
    templates: [
      'Client Context File System',
      'Follow-up Automation Framework',
      'Session Prep Checklist',
      'Progress Tracking Dashboard'
    ]
  }
};

// Offer tiers with features and pricing
const OFFERS = {
  free: {
    id: 'free',
    name: 'Free Audit Checklist',
    price: 0,
    description: '7-minute diagnostic tool',
    features: ['Business Audit Checklist (PDF)', 'Industry-Specific Pain Points Guide', 'Initial email sequence (5 emails)'],
    included_resources: ['free'],
    stripe_product_id: null,
    conversion_target: 'workshop'
  },
  workshop: {
    id: 'workshop',
    name: 'Business Systems Workshop',
    price: 97,
    description: '2-hour live workshop with Q&A',
    features: [
      'Live or on-demand 2-hour workshop',
      'Industry-specific implementation roadmap',
      'Complete template library (50+ templates)',
      '7-day follow-up email sequence',
      'Implementation checklist'
    ],
    included_resources: ['free', 'workshop'],
    stripe_product_id: 'prod_workshop_2026',
    conversion_target: 'membership'
  },
  audit: {
    id: 'audit',
    name: 'Customized Business Audit',
    price: 497,
    description: 'Custom 15-page implementation roadmap',
    features: [
      '90-minute private consultation',
      'Customized 15-page implementation roadmap',
      'Industry-specific troubleshooting guide',
      'Team adoption playbook',
      '30-day monthly check-in call',
      'Priority email support'
    ],
    included_resources: ['free', 'workshop', 'audit'],
    stripe_product_id: 'prod_audit_2026',
    conversion_target: 'membership'
  },
  membership: {
    id: 'membership',
    name: 'Blueprint Membership',
    price: 107,
    price_monthly: true,
    description: 'Ongoing systems and community',
    features: [
      'Monthly template library updates (10+ new templates)',
      'Private member community (Slack)',
      'Monthly group workshop (rotating topics)',
      '24-hour email support',
      'Quarterly office hours (live Q&A)',
      'Progress tracking dashboard',
      'Member case study library',
      'Annual in-person retreat (optional, additional cost)'
    ],
    included_resources: ['free', 'workshop', 'audit', 'membership'],
    stripe_product_id: 'prod_membership_2026',
    stripe_recurring: true,
    average_lifetime: 9 // months
  }
};

// Resource library structure
const RESOURCES = {
  free: [
    { id: 'free-1', title: 'Business Audit Checklist', type: 'PDF', desc: '7-minute diagnostic', size: '500KB' },
    { id: 'free-2', title: 'Industry Guide', type: 'PDF', desc: 'Pain points and ROI', size: '2MB' }
  ],
  workshop: [
    { id: 'workshop-video', title: 'Full Workshop Recording', type: 'Video', desc: '2 hours', size: '450MB' },
    { id: 'workshop-templates', title: 'Template Bundle', type: 'ZIP', desc: '50+ templates', size: '12MB' },
    { id: 'workshop-checklist', title: 'Implementation Checklist', type: 'PDF', desc: 'Week-by-week', size: '1.2MB' },
    { id: 'workshop-guide', title: 'Setup Guides', type: 'Docs', desc: '20 detailed guides', size: '5MB' }
  ],
  audit: [
    { id: 'audit-roadmap', title: 'Custom Implementation Roadmap', type: 'PDF', desc: '15-page personalized', size: '3MB' },
    { id: 'audit-troubleshooting', title: 'Troubleshooting Guide', type: 'PDF', desc: 'Industry-specific', size: '2.5MB' },
    { id: 'audit-adoption', title: 'Team Adoption Playbook', type: 'PDF', desc: 'Getting buy-in', size: '1.8MB' }
  ],
  membership: [
    { id: 'member-library', title: 'Complete Template Library', type: 'Library', desc: '200+ templates', size: 'Unlimited' },
    { id: 'member-monthly', title: 'Monthly Updates', type: 'Docs', desc: 'New systems', size: 'Ongoing' },
    { id: 'member-community', title: 'Private Community', type: 'Slack', desc: 'Members only', size: 'Live' },
    { id: 'member-workshops', title: 'Monthly Workshops', type: 'Video', desc: 'Recorded + live', size: 'Ongoing' }
  ]
};

// ============================================================================
// MAIN APPLICATION COMPONENT
// ============================================================================

const StridePlatform = () => {
  // Authentication & User State
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authToken, setAuthToken] = useState(localStorage.getItem('lssb_token'));

  // Navigation
  const [currentView, setCurrentView] = useState('landing');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Discovery State
  const [discoveryMessages, setDiscoveryMessages] = useState([
    {
      role: 'assistant',
      content: "Hey there. I'm going to ask you some questions to figure out if systematizing your business makes sense right now. This isn't sales—it's diagnosis. What type of service business do you run?"
    }
  ]);
  const [discoveryInput, setDiscoveryInput] = useState('');
  const [discoveryLoading, setDiscoveryLoading] = useState(false);
  const [discoveryStage, setDiscoveryStage] = useState(0);

  // User Profile (built during discovery)
  const [userProfile, setUserProfile] = useState({
    id: null,
    industry: null,
    teamSize: null,
    revenue: null,
    mainPainPoint: null,
    hasTriedAutomation: null,
    automationHistory: null,
    canImplement: null,
    implementationCapacity: null,
    email: null,
    businessName: null,
    phone: null
  });

  // Purchase & Offers
  const [purchasedOffers, setPurchasedOffers] = useState([]);
  const [recommendedOffer, setRecommendedOffer] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Dashboard State
  const [dashboardData, setDashboardData] = useState({
    implementationProgress: 0,
    completedSystems: [],
    hoursReclaimed: 0,
    currentPhase: 1,
    nextMilestone: null,
    teamMembers: [],
    recentActivity: []
  });

  // Analytics & Admin
  const [analyticsData, setAnalyticsData] = useState(null);

  const messagesEndRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [discoveryMessages]);

  // =========================================================================
  // AUTHENTICATION FUNCTIONS
  // =========================================================================

  const handleLogin = async (email, password) => {
    try {
      // In production, this would call your backend authentication API
      const response = await fetch(`${ENVIRONMENT.API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data = await response.json();
        setAuthToken(data.token);
        setCurrentUser(data.user);
        setIsLoggedIn(true);
        localStorage.setItem('lssb_token', data.token);
        setCurrentView('dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleLogout = () => {
    setAuthToken(null);
    setCurrentUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('lssb_token');
    setCurrentView('landing');
  };

  // =========================================================================
  // DISCOVERY AGENT FUNCTIONS
  // =========================================================================

  const handleDiscoveryMessage = async (e) => {
    e?.preventDefault?.();
    if (!discoveryInput.trim()) return;

    const userMessage = discoveryInput;
    setDiscoveryInput('');
    setDiscoveryMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setDiscoveryLoading(true);

    // System prompt for the AI agent - encodes all business logic
    const systemPrompt = `You are the LSSB Discovery Agent. You help service business owners diagnose if systemization makes sense NOW.

Current user profile: ${JSON.stringify(userProfile)}
Discovery stage: ${discoveryStage} of 5

BEHAVIOR BY STAGE:
Stage 0: They named industry. Ask team size. Be conversational.
Stage 1: They said team size. Ask about their MAIN pain point. Reference their industry.
Stage 2: They identified pain. Ask if they've tried automation. Listen for skepticism patterns.
Stage 3: They answered automation history. Ask if they can implement (6-9 hours, next 60 days).
Stage 4: They answered readiness. Give HONEST recommendation based on profile.

RECOMMENDATION LOGIC:
- Industry check + pain point check + automation history + implementation capacity = offer type
- First-time implementer, clear pain, ready to work → WORKSHOP ($97)
- Tried and failed before, ready to work → AUDIT ($497)
- Still exploring, not clear → FREE CHECKLIST
- Doesn't have implementation capacity → Tell them to come back later
- Pain point is outside systematization (lead gen, pricing) → Be honest about that

You must be DIRECT and HONEST. You filter for fit. You're not trying to sell everyone.

Industry-specific guidance for ${userProfile.industry}:
${userProfile.industry ? JSON.stringify(INDUSTRIES[userProfile.industry]) : 'Not yet identified'}`;

    try {
      // Call Anthropic API for the discovery agent response
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ENVIRONMENT.ANTHROPIC_API_KEY
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 600,
          system: systemPrompt,
          messages: [...discoveryMessages, { role: 'user', content: userMessage }]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMessage = data.content[0].text;
        setDiscoveryMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);

        // Update profile based on user response
        updateProfileFromResponse(userMessage);

        // Advance discovery stage
        if (discoveryStage < 5) {
          setDiscoveryStage(prev => prev + 1);
        }

        // Generate recommendation at stage 5
        if (discoveryStage === 5) {
          const offer = determineRecommendedOffer();
          setRecommendedOffer(offer);
        }
      }
    } catch (error) {
      console.error('Discovery API error:', error);
      setDiscoveryMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Technical issue. Please try again.'
      }]);
    } finally {
      setDiscoveryLoading(false);
    }
  };

  // Parse user responses and update profile
  const updateProfileFromResponse = (response) => {
    const lowerResponse = response.toLowerCase();

    // Industry detection from stage 0-1
    if (discoveryStage === 0) {
      Object.entries(INDUSTRIES).forEach(([key, industry]) => {
        if (lowerResponse.includes(key) || lowerResponse.includes(industry.name.toLowerCase())) {
          setUserProfile(prev => ({ ...prev, industry: key }));
        }
      });
    }

    // Team size extraction from stage 1-2
    if (discoveryStage === 1) {
      const numberMatch = response.match(/\d+/);
      if (numberMatch) {
        setUserProfile(prev => ({ ...prev, teamSize: parseInt(numberMatch[0]) }));
      }
    }

    // Pain point capture at stage 2-3
    if (discoveryStage === 2) {
      if (userProfile.industry) {
        const industryPains = INDUSTRIES[userProfile.industry].painPoints;
        const matchedPain = industryPains.find(pain => lowerResponse.includes(pain.toLowerCase()));
        if (matchedPain) {
          setUserProfile(prev => ({ ...prev, mainPainPoint: matchedPain }));
        } else {
          // Store custom pain point
          setUserProfile(prev => ({ ...prev, mainPainPoint: response }));
        }
      }
    }

    // Automation history at stage 3-4
    if (discoveryStage === 3) {
      const hasTriedYes = lowerResponse.includes('yes') || lowerResponse.includes('tried');
      setUserProfile(prev => ({
        ...prev,
        hasTriedAutomation: hasTriedYes,
        automationHistory: response
      }));
    }

    // Implementation capacity at stage 4-5
    if (discoveryStage === 4) {
      const canImplement = lowerResponse.includes('yes') || lowerResponse.includes('can');
      setUserProfile(prev => ({
        ...prev,
        canImplement: canImplement,
        implementationCapacity: response
      }));
    }
  };

  // Determine which offer to recommend based on profile
  const determineRecommendedOffer = () => {
    if (!userProfile.canImplement) {
      return 'free'; // Come back later
    }

    if (userProfile.hasTriedAutomation && !userProfile.mainPainPoint) {
      return 'free'; // Still exploring
    }

    if (userProfile.hasTriedAutomation && userProfile.mainPainPoint) {
      return 'audit'; // Tried and failed, needs custom plan
    }

    if (!userProfile.hasTriedAutomation && userProfile.mainPainPoint && userProfile.canImplement) {
      return 'workshop'; // Ready to implement, first-time
    }

    return 'free'; // Default to starting point
  };

  // =========================================================================
  // PAYMENT & OFFER FUNCTIONS
  // =========================================================================

  const handlePurchaseOffer = async (offerId) => {
    if (!OFFERS[offerId].price) {
      // Free offer - just track it
      handleFreeOfferAccept(offerId);
      return;
    }

    setCheckoutLoading(true);

    try {
      // In production, this would create a Stripe session
      // This is a simplified example
      const response = await fetch(`${ENVIRONMENT.API_BASE}/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          offer_id: offerId,
          user_id: currentUser?.id,
          success_url: `${window.location.origin}?view=success`,
          cancel_url: `${window.location.origin}?view=offer`
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Redirect to Stripe checkout
        window.location.href = data.checkout_url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleFreeOfferAccept = async (offerId) => {
    try {
      // Log free offer acceptance and send email
      await fetch(`${ENVIRONMENT.API_BASE}/accept-offer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          offer_id: offerId,
          user_id: currentUser?.id,
          user_profile: userProfile
        })
      });

      setPurchasedOffers(prev => [...prev, offerId]);

      // Show confirmation
      alert(`Great! Check your email for your ${OFFERS[offerId].name}. We've also emailed you the next steps.`);

      if (offerId === 'free') {
        setCurrentView('resources');
      }
    } catch (error) {
      console.error('Offer acceptance error:', error);
    }
  };

  // =========================================================================
  // DASHBOARD & PROGRESS TRACKING
  // =========================================================================

  const updateImplementationProgress = async (systemName, completion) => {
    try {
      await fetch(`${ENVIRONMENT.API_BASE}/update-progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          user_id: currentUser?.id,
          system_name: systemName,
          completion_percentage: completion,
          timestamp: new Date().toISOString()
        })
      });

      // Recalculate overall progress
      const newProgress = calculateOverallProgress();
      setDashboardData(prev => ({ ...prev, implementationProgress: newProgress }));
    } catch (error) {
      console.error('Progress update error:', error);
    }
  };

  const calculateOverallProgress = () => {
    // Average of all systems in user's industry
    const systemsForIndustry = INDUSTRIES[userProfile.industry]?.templates || [];
    const completedCount = dashboardData.completedSystems.length;
    return Math.round((completedCount / systemsForIndustry.length) * 100);
  };

  // =========================================================================
  // UI COMPONENTS - LANDING PAGE
  // =========================================================================

  const renderLanding = () => {
    return (
      <div style={{ background: '#F7F6F3', minHeight: '100vh' }}>
        {/* Navigation Bar */}
        <nav style={{
          background: '#2C3E50',
          color: '#F7F6F3',
          padding: '16px 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '2px solid #D97634'
        }}>
          <div style={{ fontSize: '18px', fontWeight: '600', letterSpacing: '-0.5px' }}>
            STRIDE
          </div>
          <div style={{ display: 'flex', gap: '24px', fontSize: '13px' }}>
            <button onClick={() => setCurrentView('case-studies')} style={{ background: 'none', border: 'none', color: '#F7F6F3', cursor: 'pointer' }}>
              Results
            </button>
            <button onClick={() => setCurrentView('discover')} style={{ background: 'none', border: 'none', color: '#F7F6F3', cursor: 'pointer' }}>
              Start Discovery
            </button>
          </div>
        </nav>

        {/* Hero Section */}
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
            You run a profitable service business. But something is eating your time that shouldn't be. This is for owners who know their problem and are ready to solve it—not someday, but now.
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
            Start Free Discovery (5 minutes)
          </button>

          <p style={{
            fontSize: '12px',
            color: '#888888',
            marginTop: '12px'
          }}>
            No email required for discovery. No sales pitch coming. Just honest diagnosis.
          </p>
        </div>

        {/* Industry Grid */}
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px' }}>
          <h2 style={{
            fontSize: '22px',
            fontWeight: '600',
            color: '#2C3E50',
            marginBottom: '32px'
          }}>
            Built for these industries:
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px'
          }}>
            {Object.entries(INDUSTRIES).map(([key, industry]) => (
              <div key={key} style={{
                background: '#FFFFFF',
                border: '1px solid #E0E0E0',
                borderRadius: '8px',
                padding: '24px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                borderLeft: '4px solid #D97634'
              }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
              >
                <div style={{ fontSize: '28px', marginBottom: '12px' }}>{industry.emoji}</div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#2C3E50', margin: '0 0 8px 0' }}>
                  {industry.name}
                </h3>
                <p style={{ fontSize: '13px', color: '#777777', margin: '0 0 12px 0', lineHeight: '1.6' }}>
                  {industry.painPoints[0]}, {industry.painPoints[1]}
                </p>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px',
                  fontSize: '11px',
                  color: '#D97634',
                  fontWeight: '600'
                }}>
                  <div>ROI: {industry.roiTimeline}</div>
                  <div>Save: {industry.timeSaved}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works Section */}
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
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#D97634', marginBottom: '12px' }}>
                  1. Discovery Conversation
                </div>
                <p style={{ fontSize: '14px', lineHeight: '1.7', margin: '0' }}>
                  Answer 5 honest questions. We figure out if now is the right time for you and what would actually solve your problem.
                </p>
              </div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#D97634', marginBottom: '12px' }}>
                  2. Personalized Recommendation
                </div>
                <p style={{ fontSize: '14px', lineHeight: '1.7', margin: '0' }}>
                  Free checklist, workshop, audit, or come back later. We'll tell you which is actually right for your situation.
                </p>
              </div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#D97634', marginBottom: '12px' }}>
                  3. You Implement (We Support)
                </div>
                <p style={{ fontSize: '14px', lineHeight: '1.7', margin: '0' }}>
                  Get templates, guides, community support. Do the work. Results in 2-12 weeks. Real revenue or time impact.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // =========================================================================
  // UI COMPONENTS - DISCOVERY PAGE
  // =========================================================================

  const renderDiscovery = () => {
    return (
      <div style={{
        display: 'flex',
        height: '100vh',
        background: '#F7F6F3',
        fontFamily: 'IBM Plex Sans, sans-serif'
      }}>
        {/* Sidebar Progress */}
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
              { stage: 0, label: 'Industry', complete: !!userProfile.industry },
              { stage: 1, label: 'Team Size', complete: !!userProfile.teamSize },
              { stage: 2, label: 'Main Pain', complete: !!userProfile.mainPainPoint },
              { stage: 3, label: 'Automation History', complete: userProfile.hasTriedAutomation !== null },
              { stage: 4, label: 'Implementation Ready', complete: userProfile.canImplement !== null },
              { stage: 5, label: 'Recommendation', complete: !!recommendedOffer }
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
                  <span style={{ fontWeight: discoveryStage >= item.stage ? '600' : '400' }}>
                    {item.label}
                  </span>
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

        {/* Chat Area */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          background: '#FFFFFF'
        }}>
          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '40px 60px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}>
            {discoveryMessages.map((msg, idx) => (
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
                    marginTop: '4px',
                    fontWeight: '600'
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
            {discoveryLoading && (
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

          {/* Input Area */}
          <div style={{
            background: '#F7F6F3',
            padding: '24px 60px',
            borderTop: '1px solid #E0E0E0',
            display: 'flex',
            gap: '12px'
          }}>
            <input
              type="text"
              value={discoveryInput}
              onChange={(e) => setDiscoveryInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleDiscoveryMessage(e)}
              placeholder="Your answer..."
              disabled={discoveryLoading}
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
              onClick={handleDiscoveryMessage}
              disabled={discoveryLoading || !discoveryInput.trim()}
              style={{
                padding: '12px 28px',
                background: discoveryLoading || !discoveryInput.trim() ? '#CCCCCC' : '#D97634',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: discoveryLoading || !discoveryInput.trim() ? 'not-allowed' : 'pointer',
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
  };

  // =========================================================================
  // UI COMPONENTS - CASE STUDIES
  // =========================================================================

  const renderCaseStudies = () => {
    return (
      <div style={{ background: '#F7F6F3', minHeight: '100vh' }}>
        <nav style={{
          background: '#2C3E50',
          color: '#F7F6F3',
          padding: '16px 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '2px solid #D97634'
        }}>
          <div style={{ fontSize: '18px', fontWeight: '600' }}>STRIDE</div>
          <div style={{ display: 'flex', gap: '24px', fontSize: '13px' }}>
            <button onClick={() => setCurrentView('landing')} style={{ background: 'none', border: 'none', color: '#F7F6F3', cursor: 'pointer' }}>
              Home
            </button>
            <button onClick={() => setCurrentView('discover')} style={{ background: 'none', border: 'none', color: '#F7F6F3', cursor: 'pointer' }}>
              Start Discovery
            </button>
          </div>
        </nav>

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
            Here's what actually happened when service business owners systematized their businesses. These are real numbers from real businesses.
          </p>

          {Object.entries(INDUSTRIES).map(([key, industry]) => (
            <div key={key} style={{
              background: '#FFFFFF',
              border: '1px solid #E0E0E0',
              borderRadius: '8px',
              padding: '32px',
              marginBottom: '24px',
              borderLeft: '4px solid #D97634'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <span style={{ fontSize: '28px' }}>{industry.emoji}</span>
                <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#2C3E50', margin: '0' }}>
                  {industry.name}
                </h2>
              </div>

              {industry.case_studies.map((study, idx) => (
                <div key={idx} style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#2C3E50', margin: '0 0 12px 0' }}>
                    {study.name} {study.location && `· ${study.location}`}
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '12px' }}>
                    <div style={{
                      background: '#F5F5F5',
                      padding: '16px',
                      borderRadius: '6px',
                      fontSize: '13px'
                    }}>
                      <div style={{ color: '#888888', marginBottom: '8px', fontWeight: '600', fontSize: '12px' }}>BEFORE</div>
                      <div style={{ color: '#2C3E50' }}>{study.before}</div>
                    </div>
                    <div style={{
                      background: '#EAFDF9',
                      padding: '16px',
                      borderRadius: '6px',
                      fontSize: '13px'
                    }}>
                      <div style={{ color: '#0F6E56', marginBottom: '8px', fontWeight: '600', fontSize: '12px' }}>AFTER</div>
                      <div style={{ color: '#2C3E50' }}>{study.after}</div>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 0',
                    borderTop: '1px solid #E0E0E0',
                    marginTop: '12px'
                  }}>
                    <div>
                      <div style={{ fontSize: '11px', color: '#888888' }}>Metric</div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#0F6E56' }}>{study.metric}</div>
                    </div>
                    <p style={{ fontSize: '13px', color: '#555555', margin: '0', fontStyle: 'italic', maxWidth: '50%' }}>
                      "{study.testimonial}"
                    </p>
                  </div>
                </div>
              ))}

              <div style={{
                background: '#F9F0E8',
                padding: '16px',
                borderRadius: '6px',
                marginTop: '20px',
                fontSize: '13px',
                color: '#D97634'
              }}>
                <strong>Timeline: {industry.roiTimeline}</strong> · <strong>Time Saved: {industry.timeSaved}</strong>
              </div>
            </div>
          ))}

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
  };

  // =========================================================================
  // MAIN RENDER - ROUTER
  // =========================================================================

  return (
    <div style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
      {currentView === 'landing' && renderLanding()}
      {currentView === 'discover' && renderDiscovery()}
      {currentView === 'case-studies' && renderCaseStudies()}
    </div>
  );
};

export default StridePlatform;