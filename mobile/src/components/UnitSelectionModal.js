import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';

const UnitSelectionModal = ({ visible, onClose, onSubmit }) => {
  const [selectedASCC, setSelectedASCC] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');

  const unitData = {
    'ARCYBER': ['NETCOM'],
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
    'USARNORTH': ['CSTA', 'TF 51', 'DCE'],
    'USARPAC': [
      '8th Army', 'I Corps', '25th ID', '11th ABN DIV', '94th AMDC',
      '8th TSC', '7th ID', '2nd ID', '5th SFAB', '1st MDTF', '3rd MDTF',
      '196th Infantry Brigade', '18th MEDCOM', '311th Signal Command',
      'USAR-J', '351st Civil Affairs Command', '9th MSC',
      '5th Battlefield Coordination Detachment', '500th MI BDE'
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
      '1st Special Forces Command', '1st SFG', '3rd SFG', '5th SFG',
      '7th SFG', '10th SFG', '19th SFG', '20th SFG', '4th POG', '8th POG',
      '95th Civil Affairs Brigade', '528th Sustainment Brigade, Special Operations'
    ]
  };

  const asccOptions = [
    'ARCYBER', 'SDDC', 'USARCENT', 'USAREUR-AF', 'USARNORTH',
    'USARPAC', 'USARSOUTH', 'USASMDC', 'USASOC'
  ];

  const handleASCCChange = (value) => {
    setSelectedASCC(value);
    setSelectedUnit('');
  };

  const handleSubmit = () => {
    if (selectedASCC && selectedUnit) {
      onSubmit({
        ascc: selectedASCC,
        unit: selectedUnit,
      });
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedASCC('');
    setSelectedUnit('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Your Unit</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Icon name="close" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Army Service Component Commands (ASCC):</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedASCC}
                  onValueChange={handleASCCChange}
                  style={styles.picker}
                >
                  <Picker.Item label="Select ASCC" value="" />
                  {asccOptions.map((ascc) => (
                    <Picker.Item key={ascc} label={ascc} value={ascc} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>UNIT:</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedUnit}
                  onValueChange={setSelectedUnit}
                  style={styles.picker}
                  enabled={!!selectedASCC}
                >
                  <Picker.Item label="Select Unit" value="" />
                  {selectedASCC && unitData[selectedASCC]?.map((unit) => (
                    <Picker.Item key={unit} label={unit} value={unit} />
                  ))}
                </Picker>
              </View>
            </View>
          </View>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => onSubmit({ ascc: selectedASCC, unit: selectedUnit, action: 'save' })}
              disabled={!selectedASCC || !selectedUnit}
            >
              <Text style={styles.saveButtonText}>Save Form</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitButton, (!selectedASCC || !selectedUnit) && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={!selectedASCC || !selectedUnit}
            >
              <Text style={styles.submitButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#2d2d2d',
    borderRadius: 8,
    width: '90%',
    maxWidth: 500,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: '#404040',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#404040',
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 5,
  },
  modalBody: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  pickerContainer: {
    backgroundColor: '#404040',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#555555',
  },
  picker: {
    color: '#ffffff',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#404040',
  },
  cancelButton: {
    backgroundColor: '#666666',
    padding: 10,
    borderRadius: 4,
    minWidth: 80,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#ffc107',
    padding: 10,
    borderRadius: 4,
    minWidth: 100,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#1a1a1a',
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#ffd700',
    padding: 10,
    borderRadius: 4,
    minWidth: 100,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#666666',
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#1a1a1a',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default UnitSelectionModal;

