import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import data from './prospectData.json';
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';


const App = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const [showAllTestimonials, setShowAllTestimonials] = useState(false);
  
  const videoContainerRef = useRef(null);
  const plyrInstanceRef = useRef(null);

  useEffect(() => {
    const container = videoContainerRef.current;
    if (!container) return;

    // Create video element dynamically to prevent React Virtual DOM mismatch issues
    const videoElement = document.createElement('video');
    videoElement.src = `${data.video_testimonial}#t=1.0`;
    videoElement.playsInline = true;
    videoElement.preload = "metadata";
    videoElement.className = "w-full h-auto";
    videoElement.setAttribute('controls', ''); // native fallback controls

    container.appendChild(videoElement);

    const PlyrConstructor = Plyr.default || Plyr;
    let playerInstance = null;
    
    try {
      playerInstance = new PlyrConstructor(videoElement, {
        controls: [
          'play-large',
          'play',
          'progress',
          'current-time',
          'mute',
          'volume',
          'settings',
          'fullscreen'
        ],
        settings: ['speed'],
        ratio: '16:9'
      });
      plyrInstanceRef.current = playerInstance;
    } catch (err) {
      console.error("Failed to initialize Plyr:", err);
    }

    return () => {
      if (playerInstance) {
        try {
          playerInstance.destroy();
        } catch (err) {
          console.error("Failed to destroy Plyr:", err);
        }
      }
      if (container) {
        container.innerHTML = '';
      }
      plyrInstanceRef.current = null;
    };
  }, [data.video_testimonial]);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };


  const faqs = data.faqs || [];
  const testimonials = data.testimonials || [];
  const visibleTestimonials = showAllTestimonials ? testimonials : testimonials.slice(0, 3);

  const getInitials = (name) => {
    if (!name) return "";
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const highlightAboutText = (text) => {
    if (!text) return '';
    
    // Pattern to match:
    // 1. Markdown bold: **text**
    // 2. Currencies and Ranges: £80M to £140M, £500k, $10M, €120k, etc.
    // 3. Number metrics: 27,000+ hours, 1,500+ clients, 17+ years, 25 countries, two decades, over a decade, etc.
    // 4. Key authority organizations & brands: Google, Accenture, Amazon, Microsoft, Apple, Netflix, Meta, Facebook, Forbes, TEDx, Stanford, Harvard, Y Combinator, YC, Inc. 5000
    // 5. Key methods & concepts: Somatic Experiencing, Yoga Therapy, LEGO® SERIOUS PLAY®, Flow Game, brutal truth, Operating System, EPIC Leadership
    const regex = /(\*\*[^*]+\*\*|[£$€]\d+(?:\.\d+)?\s*[KkMmBb]?(?:\s*to\s*[£$€]\d+(?:\.\d+)?\s*[KkMmBb]?)?|\b\d+(?:,\d+)*(?:\+)?\s*(?:hours|years|clients|countries|sessions|percent|%)\b|\b(?:\w+\s+)?decades?\b|\b(?:Google|Accenture|Amazon|Microsoft|Apple|Netflix|Meta|Facebook|Forbes|TEDx|Stanford|Harvard|Y\s*Combinator|YC|Inc\.\s*5000)\b|Somatic Experiencing|Yoga Therapy|LEGO® SERIOUS PLAY®|Flow Game|brutal truth|Operating System|EPIC Leadership)/gi;

    const parts = text.split(regex);
    // Create a non-global copy for token testing to prevent lastIndex state issues in the loop
    const testRegex = new RegExp(regex.source, 'i');

    return parts.map((part, i) => {
      if (!part) return null;
      if (part.startsWith('**') && part.endsWith('**')) {
        const content = part.slice(2, -2);
        return <span key={i} className="text-accent font-extrabold">{content}</span>;
      }
      if (testRegex.test(part)) {
        return <span key={i} className="text-accent font-extrabold">{part}</span>;
      }
      return part;
    });
  };

  // Resolve booking URL: use extracted booking link if available, fallback to #book
  const bookingUrl = data.booking_link && data.booking_link !== '[PLUG]' && data.booking_link.trim() !== '' ? data.booking_link.trim() : '#book';
  const isExternal = bookingUrl.startsWith('http');
  const linkProps = isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {};

  return (
    <div className="w-full min-h-screen bg-bg-primary text-text-primary selection:bg-accent selection:text-black">
      
      {/* ============================================= */}
      {/* 1. HERO SECTION                               */}
      {/* ============================================= */}
      <section className="pt-30 pb-20 bg-[radial-gradient(circle_at_top_left,var(--color-bg-secondary)_0%,var(--color-bg-primary)_80%)] border-b border-border-light">
        <div className="container-dtc grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-15 items-center">
          <div className="text-center lg:text-left max-w-2xl mx-auto lg:max-w-none">
            <div className="inline-block px-4 py-2 bg-accent-faded text-accent border border-border-light rounded-full font-bold text-xs uppercase tracking-wider mb-6">
              Invite-Only Strategy Session
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-6xl font-extrabold tracking-tight leading-[1.05] mb-6">
              {data.hero.headline.split(/(<span>|<\/span>)/).map((part, i) => 
                part === '<span>' || part === '</span>' ? null : (i > 0 && data.hero.headline.split(/(<span>|<\/span>)/)[i-1] === '<span>' ? <span key={i} className="text-accent">{part}</span> : part)
              )}
            </h1>
            <p className="text-lg md:text-xl text-text-secondary max-w-[600px] mx-auto lg:mx-0 mb-10">
              {data.hero.subheadline}
            </p>
            
            <div className="flex flex-col items-center lg:items-start gap-5">
              <a href={bookingUrl} className="inline-flex items-center justify-center bg-text-primary text-black font-bold text-lg md:text-xl px-10 py-5 rounded-lg transition-all duration-200 border border-transparent cursor-pointer hover:bg-accent hover:text-black text-center" {...linkProps}>
                {data.hero.cta_btn} &rarr;
              </a>
              <p className="text-sm text-text-tertiary max-w-[420px] leading-relaxed font-medium pl-0.5 text-center lg:text-left">
                {data.hero.risk_reversal}
              </p>
            </div>
          </div>
          
          <div className="flex justify-center w-full">
            <div className="relative w-full max-w-[400px] lg:max-w-[450px] mx-auto">
               <div className="w-full aspect-[3/4] bg-bg-secondary border border-border-focus rounded-3xl flex items-center justify-center text-text-tertiary text-base text-center p-5 shadow-2xl overflow-hidden" style={data.hero_image ? { padding: 0 } : {}}>
                  {data.hero_image ? (
                    <img 
                      src="/assets/jake_portrait.png"
                      alt={data.about?.name || data.coach_name} 
                      className="w-full h-full object-cover rounded-3xl"
                    />
                  ) : (
                    `${data.about?.name || data.coach_name} Headshot`
                  )}
               </div>
               <div className="absolute bg-bg-primary border border-border-focus px-6 py-4 rounded-lg shadow-2xl flex flex-col gap-1 top-5 left-5 lg:top-10 lg:-right-[30px] lg:left-auto">
                  <span className="text-2xl lg:text-3xl font-extrabold text-accent leading-none">{data.about?.revenue_generated || "$0"}</span>
                  <span className="text-xs lg:text-sm text-text-secondary font-medium">{data.about?.revenue_label || "Revenue Generated"}</span>
               </div>
               <div className="absolute bg-bg-primary border border-border-focus px-6 py-4 rounded-lg shadow-2xl flex flex-col gap-1 bottom-5 left-5 lg:bottom-10 lg:-left-[30px]">
                  <div className="text-amber-400 text-lg tracking-widest leading-none mb-0.5">★★★★★</div>
                  <span className="text-xs lg:text-sm text-text-secondary font-medium">100% Actionable Clarity</span>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST ELEMENTS BAR */}
      <section className="py-7 border-b border-border-light bg-bg-secondary">
        <div className="container-dtc flex items-center justify-center gap-6 lg:gap-10 flex-wrap">
          <div className="flex items-center gap-2.5 text-sm font-semibold text-text-secondary whitespace-nowrap">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="stroke-accent" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            <span>{data.trust_bar[0] || "100% Risk-Free"}</span>
          </div>
          <div className="hidden lg:block w-px h-6 bg-border-focus"></div>
          <div className="flex items-center gap-2.5 text-sm font-semibold text-text-secondary whitespace-nowrap">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="stroke-accent" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            <span>{data.trust_bar[1] || "45-Minute Deep Dive"}</span>
          </div>
          <div className="hidden lg:block w-px h-6 bg-border-focus"></div>
          <div className="flex items-center gap-2.5 text-sm font-semibold text-text-secondary whitespace-nowrap">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="stroke-accent" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <span>{data.trust_bar[2] || "500+ Sessions Delivered"}</span>
          </div>
          <div className="hidden lg:block w-px h-6 bg-border-focus"></div>
          <div className="flex items-center gap-2.5 text-sm font-semibold text-text-secondary whitespace-nowrap">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="stroke-accent" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
            <span>{data.trust_bar[3] || "98% Satisfaction Rate"}</span>
          </div>
        </div>
      </section>

      {/* ============================================= */}
      {/* 2. PROBLEM + SOLUTION SECTION                 */}
      {/* ============================================= */}
      <section className="py-20 lg:py-32">
        <div className="container-dtc">
          
          {/* Problem Half */}
          <div className="mb-24">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-6xl font-bold tracking-tight mb-4">
                The old model of <span className="text-accent">{data.problem_solution.industry_standard}</span> is completely broken.
              </h2>
              <p className="text-text-secondary text-lg md:text-xl max-w-[600px] mx-auto">
                If any of this sounds familiar, you are not alone. And it is not your fault.
              </p>
            </div>

            <div className="flex flex-col gap-5 max-w-[900px] mx-auto">
              {data.problem_solution.pain_points.map((p, idx) => (
                <div className="flex items-start gap-5 bg-bg-tertiary border border-border-light rounded-2xl p-6 md:p-8 transition-all duration-200 hover:border-border-focus hover:translate-x-1" key={idx}>
                  <div className="w-9 h-9 min-w-[36px] bg-danger-faded text-danger rounded-lg flex items-center justify-center font-extrabold text-base mt-0.5">✕</div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold mb-1.5">{p.title}</h4>
                    <p className="text-text-secondary text-sm md:text-base leading-relaxed">{p.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Solution / Offer Half */}
          <div className="max-w-[900px] mx-auto">
            <div className="gradient-border-top bg-[linear-gradient(145deg,var(--color-bg-tertiary)_0%,#0d0d0d_100%)] border border-border-focus rounded-3xl px-7 py-10 md:p-14 relative overflow-hidden">
              <div className="text-xs uppercase tracking-widest text-accent font-bold mb-4 block">The Solution</div>
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-5">
                The <span className="text-accent">{data.problem_solution.solution.mechanism}</span> Blueprint Session
              </h2>
              <p className="text-text-secondary text-base md:text-lg leading-relaxed mb-10 max-w-2xl">
                {data.problem_solution.solution.description}
              </p>
              
              <div className="flex flex-col gap-4 mb-12">
                {data.problem_solution.solution.deliverables.map((d, idx) => (
                  <div className="flex items-center gap-4 text-base md:text-lg font-medium" key={idx}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="stroke-accent" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    <span>{d}</span>
                  </div>
                ))}
              </div>

              <a href={bookingUrl} className="inline-flex items-center justify-center bg-text-primary text-black font-bold text-lg md:text-xl px-10 py-5 rounded-lg transition-all duration-200 border border-transparent cursor-pointer hover:bg-accent hover:text-black text-center w-full" {...linkProps}>
                Claim Your Free Blueprint Session &rarr;
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* ============================================= */}
      {/* 3. WHO IS THIS FOR / NOT FOR                  */}
      {/* ============================================= */}
      <section className="py-20 lg:py-32 bg-bg-secondary border-t border-b border-border-light">
        <div className="container-dtc">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-6xl font-bold tracking-tight mb-4">
              Is This <span className="text-accent">Right For You?</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-[1000px] mx-auto">
            <div className="bg-bg-primary border border-accent/15 rounded-3xl p-7 md:p-10 lg:p-12">
              <div className="flex items-center gap-4 mb-8 pb-6 border-b border-border-light">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="stroke-accent" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <h3 className="text-xl md:text-2xl font-bold">This IS for you if...</h3>
              </div>
              <ul className="list-none flex flex-col gap-4">
                {data.fit.is_for.map((item, idx) => (
                  <li className="pl-7 relative text-base md:text-lg font-medium leading-relaxed before:content-['✓'] before:absolute before:left-0 before:text-accent before:font-bold" key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="bg-bg-primary border border-danger/15 rounded-3xl p-7 md:p-10 lg:p-12">
              <div className="flex items-center gap-4 mb-8 pb-6 border-b border-border-light">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="stroke-danger" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                <h3 className="text-xl md:text-2xl font-bold">This is NOT for you if...</h3>
              </div>
              <ul className="list-none flex flex-col gap-4">
                {data.fit.is_not_for.map((item, idx) => (
                  <li className="pl-7 relative text-base md:text-lg font-medium leading-relaxed before:content-['✕'] before:absolute before:left-0 before:text-danger before:font-bold" key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================= */}
      {/* 4. TESTIMONIALS SECTION                       */}
      {/* ============================================= */}
      <section className="py-20 lg:py-32">
        <div className="container-dtc">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-6xl font-bold tracking-tight mb-4">Don't Take Our Word For It</h2>
            <p className="text-text-secondary text-lg md:text-xl max-w-[600px] mx-auto">Here is what happens when strategy replaces guesswork.</p>
          </div>

          {/* Conditional Video Testimonial */}
          {data.video_testimonial && (
            <div className="w-full max-w-5xl mx-auto mb-16">
              <div className="group relative rounded-[2rem] bg-black p-2 shadow-[0_0_50px_rgba(0,0,0,0.9)] border border-white/5 transition-all duration-500 hover:border-white/10">
                {data.video_testimonial.toLowerCase().endsWith('.mp4') ? (
                  <div 
                    ref={videoContainerRef}
                    className="w-full rounded-[1.8rem] overflow-hidden bg-black shadow-2xl ring-1 ring-white/5"
                  />
                ) : (
                  <div className="w-full aspect-video rounded-[1.8rem] overflow-hidden bg-black shadow-2xl ring-1 ring-white/5">
                    <iframe
                      src={data.video_testimonial}
                      title="Video Testimonial"
                      loading="lazy"
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    ></iframe>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Conditional Featured Testimonial */}
          {data.featured_testimonial && (
            <div className="w-full max-w-4xl mx-auto mb-20">
              <div className="group relative rounded-[2rem] bg-[#0A0A0A] border border-white/10 p-8 md:p-12 flex flex-col justify-between overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.8)] transition-all duration-500 hover:border-white/20">
                {/* Premium subtle glow background */}
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent opacity-50"></div>
                
                <div className="relative z-10 flex-grow flex flex-col">
                  <div className="text-accent mb-6">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="opacity-80">
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                    </svg>
                  </div>
                  <p className="font-medium leading-[1.8] text-zinc-300 text-lg md:text-xl tracking-wide mb-10">
                    {data.featured_testimonial.quote}
                  </p>
                </div>
                
                <div className="relative z-10 flex items-center gap-5 pt-6 border-t border-white/10 mt-auto">
                  <div className="w-14 h-14 rounded-full bg-zinc-900 border border-white/20 flex items-center justify-center font-bold text-accent text-lg shadow-inner">
                    {getInitials(data.featured_testimonial.name)}
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-lg text-white tracking-wide">{data.featured_testimonial.name}</span>
                    <span className="text-zinc-500 text-sm font-medium">{data.featured_testimonial.title}</span>
                  </div>
                </div>
              </div>
            </div>
          )}


          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-16">
            {visibleTestimonials.map((t, idx) => (
              <div key={idx} className={`group relative rounded-3xl bg-[#0A0A0A] border border-white/10 p-8 md:p-10 flex flex-col justify-between transition-all duration-500 hover:-translate-y-2 hover:border-white/20 hover:shadow-[0_20px_40px_rgba(0,0,0,0.6)] overflow-hidden ${idx === 0 ? 'md:col-span-2 lg:col-span-1 bg-gradient-to-br from-[#111] to-[#0A0A0A]' : ''}`}>
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative z-10 flex-grow flex flex-col">
                  <div className="text-zinc-700 mb-5 transition-colors duration-500 group-hover:text-zinc-500">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                    </svg>
                  </div>
                  <p className={`font-medium leading-[1.7] text-zinc-400 mb-8 tracking-wide ${idx === 0 ? 'text-zinc-300 md:text-lg' : 'text-base'}`}>
                    {t.quote}
                  </p>
                </div>
                
                <div className="relative z-10 flex items-center gap-4 pt-6 border-t border-white/5 mt-auto">
                  <div className={`rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center font-bold text-zinc-300 ${idx === 0 ? "w-12 h-12 text-sm" : "w-10 h-10 text-xs"}`}>
                    {getInitials(t.name)}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-sm text-zinc-200 tracking-wide">{t.name}</span>
                    <span className="text-zinc-600 text-xs font-medium uppercase tracking-wider">{t.title}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Premium Show All Toggle Button */}
          {testimonials.length > 3 && (
            <div className="flex justify-center mb-20 relative z-20">
              <button
                onClick={() => setShowAllTestimonials(!showAllTestimonials)}
                className="group flex items-center gap-3 px-8 py-4 font-bold text-sm tracking-widest uppercase text-zinc-300 bg-transparent border border-white/10 rounded-full hover:bg-white hover:text-black hover:border-white transition-all duration-500 shadow-2xl cursor-pointer overflow-hidden relative"
              >
                <span className="relative z-10">
                  {showAllTestimonials ? 'Show Less' : 'Show All Experiences'}
                </span>
                <div className={`relative z-10 w-6 h-6 rounded-full bg-white/10 group-hover:bg-black/10 flex items-center justify-center transition-transform duration-500 ${showAllTestimonials ? 'rotate-180' : ''}`}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
            </div>
          )}

          <div className="text-center">
            <a href={bookingUrl} className="inline-flex items-center justify-center bg-text-primary text-black font-bold text-lg md:text-xl px-10 py-5 rounded-lg transition-all duration-200 border border-transparent cursor-pointer hover:bg-accent hover:text-black text-center" {...linkProps}>
              Get Your Free Blueprint &rarr;
            </a>
          </div>
        </div>
      </section>

      {/* ============================================= */}
      {/* 5. ABOUT SECTION                              */}
      {/* ============================================= */}
      <section className="py-20 lg:py-32 bg-bg-secondary border-t border-b border-border-light">
        <div className="container-dtc grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-10 lg:gap-20 items-center">
          <div className="w-full max-w-[400px] mx-auto lg:max-w-none">
            <div className="w-full aspect-[3/4] bg-bg-tertiary border border-border-focus rounded-3xl flex items-center justify-center text-text-tertiary text-sm text-center p-5 shadow-2xl overflow-hidden" style={data.about_image ? { padding: 0 } : {}}>
              {data.about_image ? (
                <img 
                  src={data.about_image} 
                  alt={data.about?.name || data.coach_name} 
                  className="w-full h-full object-cover rounded-3xl"
                />
              ) : (
                `${data.about?.name || data.coach_name} Photo`
              )}
            </div>
          </div>
          <div className="flex-1">
            <div className="text-xs uppercase tracking-widest text-accent font-bold mb-3">Who You'll Be Speaking With</div>
            <h2 className="text-3xl md:text-4xl lg:text-6xl font-bold tracking-tight mb-8 text-left">Meet <span className="text-accent">{data.about.name}</span></h2>
            <div className="text-text-secondary text-base md:text-lg leading-relaxed mb-5 last:mb-0">
              {data.about.paragraphs.map((p, idx) => (
                <p className="mb-4 last:mb-0" key={idx}>{highlightAboutText(p)}</p>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-12 pt-8 border-t border-border-light">
              <div className="bg-bg-tertiary/40 backdrop-blur-md border border-border-light rounded-2xl p-6 transition-all duration-300 hover:border-accent/30 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(204,255,0,0.03)] flex flex-col justify-between group">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-accent-faded flex items-center justify-center text-accent">
                    {/countr/i.test(data.about.revenue_label || '') || /global/i.test(data.about.revenue_label || '') ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="2" y1="12" x2="22" y2="12" />
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="1" x2="12" y2="23" />
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                      </svg>
                    )}
                  </div>
                  <span className="w-1.5 h-1.5 rounded-full bg-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-accent tracking-tight mb-1">{data.about.revenue_generated}</div>
                  <div className="text-xs text-text-secondary font-semibold uppercase tracking-wider">{data.about.revenue_label || "Revenue Generated"}</div>
                </div>
              </div>

              <div className="bg-bg-tertiary/40 backdrop-blur-md border border-border-light rounded-2xl p-6 transition-all duration-300 hover:border-accent/30 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(204,255,0,0.03)] flex flex-col justify-between group">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-accent-faded flex items-center justify-center text-accent">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>
                  <span className="w-1.5 h-1.5 rounded-full bg-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-accent tracking-tight mb-1">{data.about.clients_served}</div>
                  <div className="text-xs text-text-secondary font-semibold uppercase tracking-wider">Clients Served</div>
                </div>
              </div>

              <div className="bg-bg-tertiary/40 backdrop-blur-md border border-border-light rounded-2xl p-6 transition-all duration-300 hover:border-accent/30 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(204,255,0,0.03)] flex flex-col justify-between group">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-accent-faded flex items-center justify-center text-accent">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                  <span className="w-1.5 h-1.5 rounded-full bg-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-accent tracking-tight mb-1">{data.about.years}+</div>
                  <div className="text-xs text-text-secondary font-semibold uppercase tracking-wider">Years Experience</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================= */}
      {/* 6. OBJECTION HANDLING - FAQ                   */}
      {/* ============================================= */}
      <section className="py-20 lg:py-32">
        <div className="container-dtc">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-6xl font-bold tracking-tight mb-4">
              Still Have <span className="text-accent">Questions?</span>
            </h2>
            <p className="text-text-secondary text-lg md:text-xl max-w-[600px] mx-auto">Everything you need to know before you book.</p>
          </div>

          <div className="max-w-[800px] mx-auto flex flex-col gap-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className={`bg-bg-secondary border rounded-lg px-8 cursor-pointer transition-colors duration-200 ${openFaq === idx ? 'border-text-primary' : 'border-border-light hover:border-border-focus'}`} onClick={() => toggleFaq(idx)}>
                <div className="py-7 flex justify-between items-center gap-4">
                  <h4 className="text-lg font-semibold">{faq.q}</h4>
                  <div className={`text-2xl font-light shrink-0 ml-4 ${openFaq === idx ? 'text-text-primary' : 'text-text-secondary'}`}>{openFaq === idx ? '−' : '+'}</div>
                </div>
                <div className="transition-[max-height,padding] duration-300 ease-in-out overflow-hidden" style={{ maxHeight: openFaq === idx ? '200px' : '0px', paddingBottom: openFaq === idx ? '28px' : '0px' }}>
                  <p className="text-text-secondary text-base md:text-lg leading-relaxed">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================= */}
      {/* 7. FINAL CTA - Scarcity + Urgency + Guarantee */}
      {/* ============================================= */}
      <section id="book" className="pt-8 pb-32">
        <div className="container-dtc">
          <div className="gradient-border-top-center bg-bg-tertiary border border-border-focus rounded-3xl py-16 px-6 md:p-20 text-center relative overflow-hidden">
            
            {/* Urgency */}
            <div className="inline-flex items-center gap-3 px-6 py-2 bg-bg-primary border border-border-light rounded-full font-semibold text-sm text-text-secondary mb-10">
              <span className="w-2 h-2 bg-accent rounded-full shadow-[0_0_10px_var(--color-accent)] animate-blink-slow"></span> {data.final_cta.urgency}
            </div>
            
            <h2 className="text-3xl md:text-5xl font-bold max-w-[800px] mx-auto mb-5 leading-tight">{data.final_cta.headline}</h2>
            <p className="text-text-secondary text-base md:text-lg max-w-[600px] mx-auto mb-12 leading-relaxed">{data.final_cta.subtext}</p>
            
            {/* Guarantee */}
            <div className="flex flex-col md:flex-row items-start gap-5 bg-bg-primary border border-accent/20 rounded-2xl p-6 md:p-8 text-left max-w-[700px] mx-auto mb-12">
              <div className="w-12 h-12 min-w-[48px] bg-accent-faded rounded-lg flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="stroke-accent" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-bold mb-2 text-accent">{data.final_cta.guarantee_title}</h4>
                <p className="text-text-secondary text-sm md:text-base leading-relaxed">{data.final_cta.guarantee_text}</p>
              </div>
            </div>

            {/* Scarcity countdown visual */}
            <div className="flex flex-col items-center gap-3 mb-12">
              <div className="flex gap-1.5">
                {Array.from({ length: data.final_cta.slots_total || 10 }).map((_, idx) => (
                  <div key={idx} className={`w-7 h-2 rounded-full transition-all duration-300 ${idx < (data.final_cta.slots_filled || 6) ? 'bg-accent opacity-80' : 'bg-border-focus opacity-40'}`}></div>
                ))}
              </div>
              <span className="text-xs font-semibold text-text-tertiary">{data.final_cta.slots_label}</span>
            </div>
            
            <div className="flex flex-col items-center gap-4">
              <a href={bookingUrl} className="inline-flex items-center justify-center bg-text-primary text-black font-bold text-lg md:text-xl lg:text-2xl px-8 py-4 md:px-14 md:py-5.5 rounded-lg transition-all duration-200 border border-transparent cursor-pointer hover:bg-accent hover:text-black text-center" {...linkProps}>
                {data.hero.cta_btn} &rarr;
              </a>
              <p className="text-xs font-medium text-text-tertiary">Free. No obligation. Walk away with a custom blueprint.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-10 border-t border-border-light text-center text-text-tertiary text-sm">
        <div className="container-dtc">
          <p>&copy; {new Date().getFullYear()} {data.coach_name}. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
};

export default App;