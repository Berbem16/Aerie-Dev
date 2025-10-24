import React, { useState } from 'react';
import './App.css';

const UnitSelectionModal = ({ isOpen, onClose, onSubmit }) => {
  const [selectedASCC, setSelectedASCC] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');

  // Unit data structure - ASCC to UNIT mappings
  const unitData = {
    'ARCYBER': [
      'NETCOM'
    ],
    'SDDC': [
      '595th Transportation BDE',
      '596th Transportation BDE',
      '597th Transportation BDE',
      '598th Transportation BDE',
      '599th Transportation BDE'
    ],
    'USARCENT': [
      'TF Spartan',
      '1st TSC',
      '160th Signal BDE',
      'ASG - Kuwait',
      '4th BN Coordination Detachment',
      'ASG - Jordan',
      '513th MIB'
    ],
    'USAREUR-AF': [
      'V Corps',
      '56th Artillery Command',
      '7th Army Training Command',
      '10th Army Air & Missile Defense Command',
      '21st Theater Sustainment Command',
      'Southern European Task Force – Africa',
      'Headquarters & Headquarters Battalion',
      'U.S. Army Europe and Africa Band and Chorus',
      'U.S. Army NATO Brigade',
      '68th Medical Command'
    ],
    'USARNORTH': [
      'CSTA',
      'TF 51',
      'DCE'
    ],
    'USARPAC': [
      '8th Army',
      'I Corps',
      '25th ID',
      '11th ABN DIV',
      '94th AMDC',
      '8th TSC',
      '7th ID',
      '2nd ID',
      '5th SFAB',
      '1st MDTF',
      '3rd MDTF',
      '196th Infantry Brigade',
      '18th MEDCOM',
      '311th Signal Command',
      'USAR-J',
      '351st Civil Affairs Command',
      '9th MSC',
      '5th Battlefield Coordination Detachment',
      '500th MI BDE'
    ],
    'USARSOUTH': [
      '470th MIB',
      '56th Signal BN',
      '1st BN',
      '228th Aviation Regiment'
    ],
    'USASMDC': [
      '100th Missile Defense Brigade',
      '1st Space Brigade',
      'SMDCOE'
    ],
    'USASOC': [
      '1st Special Forces Command',
      '1st SFG',
      '3rd SFG',
      '5th SFG',
      '7th SFG',
      '10th SFG',
      '19th SFG',
      '20th SFG',
      '4th POG',
      '8th POG',
      '95th Civil Affairs Brigade',
      '528th Sustainment Brigade, Special Operations'
    ]
  };

  const asccOptions = [
    'ARCYBER',
    'SDDC', 
    'USARCENT',
    'USAREUR-AF',
    'USARNORTH',
    'USARPAC',
    'USARSOUTH',
    'USASMDC',
    'USASOC'
  ];

  const handleASCCChange = (e) => {
    const ascc = e.target.value;
    setSelectedASCC(ascc);
    setSelectedUnit(''); // Reset unit selection when ASCC changes
  };

  const handleUnitChange = (e) => {
    setSelectedUnit(e.target.value);
  };

  const handleSubmit = () => {
    if (selectedASCC && selectedUnit) {
      onSubmit({
        ascc: selectedASCC,
        unit: selectedUnit
      });
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedASCC('');
    setSelectedUnit('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Select Your Unit</h2>
          <button className="modal-close" onClick={handleClose}>
            ×
          </button>
        </div>
        
        <div className="modal-body">
          <div className="form-group">
            <label htmlFor="ascc">Army Service Component Commands (ASCC):</label>
            <select
              id="ascc"
              value={selectedASCC}
              onChange={handleASCCChange}
              className="form-input"
              required
            >
              <option value="">Select ASCC</option>
              {asccOptions.map((ascc) => (
                <option key={ascc} value={ascc}>
                  {ascc}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="unit">UNIT:</label>
            <select
              id="unit"
              value={selectedUnit}
              onChange={handleUnitChange}
              className="form-input"
              required
              disabled={!selectedASCC}
            >
              <option value="">Select Unit</option>
              {selectedASCC && unitData[selectedASCC]?.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="modal-footer">
          <button 
            type="button" 
            className="clear-search-btn" 
            onClick={handleClose}
          >
            Cancel
          </button>
          <button 
            type="button" 
            className="save-form-btn" 
            onClick={() => onSubmit({ ascc: selectedASCC, unit: selectedUnit, action: 'save' })}
            disabled={!selectedASCC || !selectedUnit}
          >
            Save Form
          </button>
          <button 
            type="button" 
            className="submit-btn" 
            onClick={handleSubmit}
            disabled={!selectedASCC || !selectedUnit}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnitSelectionModal;
