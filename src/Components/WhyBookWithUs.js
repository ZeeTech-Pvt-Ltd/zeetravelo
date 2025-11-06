import React from 'react';
import { FaHandHoldingUsd, FaCreditCard, FaHeadset, FaShieldAlt } from 'react-icons/fa';
import './WhyBookWithUs.css';

const features = [
  {
    icon: <FaHandHoldingUsd size={40} />,
    title: 'Affordable Flight Deals',
    description: 'Save big with exclusive discounts on domestic and international flights.',
  },
  {
    icon: <FaCreditCard size={40} />,
    title: 'Pay in Your Currency',
    description: 'Book flights using 17+ supported currencies worldwide for your convenience.',
  },
  {
    icon: <FaHeadset size={40} />,
    title: '24/7 Customer Support',
    description: 'Enjoy round-the-clock support for all your travel needs and queries.',
  },
  {
    icon: <FaShieldAlt size={40} />,
    title: 'Secure Payments',
    description: 'Your transactions are protected with industry‑standard encryption.',
  },
];

const WhyBookWithUs = () => {
  return (
    <div className="popular-flights-container" style={{ background: 'transparent', paddingTop: '0', paddingBottom: '0' }}>
      <div className="recommended-header-container text-center" style={{ marginBottom: '32px' }}>
        <h5 className="recommended-header-title">Why Book with ZeeTravelo?</h5>
      </div>
      <div className="popular-flights-grid">
        {features.map((f, idx) => (
          <div key={idx} className="flight-card" style={{ backgroundColor: '#0b0f19', background: '#0b0f19', paddingBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '28px', paddingBottom: '12px', color: '#0b5ed7' }}>
              {f.icon}
            </div>
            <div className="travel-content" style={{ textAlign: 'center', padding: '16px 18px 20px 18px' }}>
              <div className="travel-title" style={{ color: '#ffffff', fontWeight: 800, marginBottom: '8px' }}>{f.title}</div>
              <div className="travel-desc" style={{ color: '#e5ecff', lineHeight: '1.6' }}>{f.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WhyBookWithUs;

