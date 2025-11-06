import React from 'react';
import './OffersSection.css';

const offerBanners = [
  { id: 1, title: 'Special Flight Deals', subtitle: 'Save more on top routes' },
  { id: 2, title: 'Bank Discounts', subtitle: 'Exclusive cards offer' },
  { id: 3, title: 'Hotel Savings', subtitle: 'Up to 30% off' },
  { id: 4, title: 'Car Rentals', subtitle: 'Weekend offers' },
  { id: 5, title: 'Holiday Packages', subtitle: 'Bundle & save' },
];

export default function OffersSection() {
  return (
    <section className="offers-section">
      <div className="site-container">
        <div className="recommended-header-container text-center">
          <h5 className="recommended-header-title">Offers</h5>
        </div>
        <div className="offers-grid">
          {offerBanners.map((o) => (
            <div key={o.id} className="offer-card">
              <div className="offer-bg" />
              <div className="offer-content">
                <div className="offer-title">{o.title}</div>
                <div className="offer-subtitle">{o.subtitle}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


