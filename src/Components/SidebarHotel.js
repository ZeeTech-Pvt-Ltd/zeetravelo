import React, { useEffect, useState } from 'react';
import { Card, Form, Button, Collapse } from 'react-bootstrap';

const SidebarHotel = () => {
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1200);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1200);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="mb-3">
      {isMobile && (
        <Button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="w-100 mb-2"
          variant="outline-primary"
        >
          {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
        </Button>
      )}

      <Collapse in={!isMobile || showMobileFilters}>
        <div>
          <Card className="p-3 shadow-sm">
            <h4>Filters</h4>
            <hr />

            {/* Star Rating */}
            <div className="mb-3">
              <Form.Label className="fw-bold">Star Rating</Form.Label>
              {[5, 4, 3, 2, 1].map((star) => (
                <Form.Check
                  key={star}
                  type="checkbox"
                  label={`${star} Star`}
                  defaultChecked={star >= 3}
                />
              ))}
            </div>

            {/* Price Range */}
            <div className="mb-3">
              <Form.Label className="fw-bold">Price Range</Form.Label>
              <Form.Range min={1000} max={10000} defaultValue={5000} />
              <div className="d-flex justify-content-between small text-muted">
                <span>USD 100</span>
                <span>USD 10,000</span>
              </div>
            </div>

            {/* Facilities */}
            <div className="mb-3">
              <Form.Label className="fw-bold">Facilities</Form.Label>
              <Form.Check type="checkbox" label="Free Wi-Fi" defaultChecked />
              <Form.Check type="checkbox" label="Breakfast Included" defaultChecked />
              <Form.Check type="checkbox" label="Swimming Pool" />
            </div>
          </Card>
        </div>
      </Collapse>
    </div>
  );
};

export default SidebarHotel;
