import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import API_URL from '../config/api';
import { getCurrentLocation, reverseGeocode, geocodeAddress } from '../utils/location';
import { takePhoto, pickImage } from '../utils/camera';
import { saveForm, getSavedForms } from '../utils/storage';
import UnitSelectionModal from '../components/UnitSelectionModal';

const HomeScreen = () => {
  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const [formData, setFormData] = useState({
    type_of_sighting: '',
    time: getCurrentDateTime(),
    latitude: '',
    longitude: '',
    location_name: '',
    description: '',
    symbol_code: '',
  });

  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [photoUris, setPhotoUris] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [sightingsCount, setSightingsCount] = useState(0);
  const [pendingReports, setPendingReports] = useState(0);
  const [savedFormsCount, setSavedFormsCount] = useState(0);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [showImagePickerModal, setShowImagePickerModal] = useState(false);

  const sightingTypeOptions = [
    'UAS - Fixed Wing',
    'UAS - Rotary Wing',
    'UAS - Small Commercial',
    'UAS - Large Commercial',
    'Manned - Fixed Wing',
    'Manned - Rotary Wing',
  ];

  useEffect(() => {
    fetchSightingsCount();
    loadSavedFormsCount();
  }, []);

  useEffect(() => {
    checkPendingReports();
  }, [formData, photoUris]);

  const fetchSightingsCount = async () => {
    try {
      const response = await fetch(`${API_URL}/sightings`);
      if (response.ok) {
        const data = await response.json();
        setSightingsCount(data.length);
      }
    } catch (error) {
      console.error('Error fetching sightings count:', error);
    }
  };

  const loadSavedFormsCount = async () => {
    try {
      const forms = await getSavedForms();
      setSavedFormsCount(forms.length);
    } catch (error) {
      console.error('Error loading saved forms count:', error);
    }
  };

  const checkPendingReports = () => {
    const hasData =
      formData.type_of_sighting ||
      formData.latitude ||
      formData.longitude ||
      formData.location_name ||
      formData.description ||
      photoUris.length > 0;
    setPendingReports(hasData ? 1 : 0);
  };

  const handleInputChange = (name, value) => {
    let symbolCode = formData.symbol_code;

    if (name === 'type_of_sighting') {
      if (value === 'UAS - Fixed Wing') {
        symbolCode = 'SHGPUCVUF-';
      } else if (value === 'UAS - Rotary Wing') {
        symbolCode = 'SHGPUCVUR-';
      } else if (value === 'UAS - Small Commercial' || value === 'UAS - Large Commercial') {
        symbolCode = 'SNGPUCVU--';
      } else if (value === 'Manned - Fixed Wing' || value === 'Manned - Rotary Wing') {
        symbolCode = 'SHGPUCVF--';
      } else {
        symbolCode = '';
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
      symbol_code: symbolCode,
    }));
  };

  const handleUseCurrentLocation = async () => {
    setIsLoading(true);
    setMessage('Getting current location...');
    const locationResult = await getCurrentLocation();
    
    if (locationResult.success) {
      setFormData((prev) => ({
        ...prev,
        latitude: locationResult.latitude.toFixed(6),
        longitude: locationResult.longitude.toFixed(6),
      }));

      const address = await reverseGeocode(locationResult.latitude, locationResult.longitude);
      if (address) {
        setFormData((prev) => ({
          ...prev,
          location_name: address,
        }));
      }
      setMessage('Location updated from GPS');
    } else {
      setMessage(`Error: ${locationResult.error}`);
      Alert.alert('Location Error', locationResult.error);
    }
    setIsLoading(false);
  };

  const handleSearchLocation = async () => {
    if (!formData.location_name.trim()) {
      setMessage('Please enter a location to search');
      return;
    }

    setIsLoading(true);
    setMessage('Searching for location...');
    const result = await geocodeAddress(formData.location_name);
    
    if (result.success) {
      setFormData((prev) => ({
        ...prev,
        latitude: result.latitude.toFixed(6),
        longitude: result.longitude.toFixed(6),
        location_name: result.address || formData.location_name,
      }));
      setMessage('Location found and coordinates updated');
    } else {
      setMessage(`Error: ${result.error}`);
      Alert.alert('Location Error', result.error);
    }
    setIsLoading(false);
  };

  const handleTakePhoto = async () => {
    const result = await takePhoto();
    if (result.success) {
      setPhotoUris((prev) => [...prev, result.uri]);
    } else {
      Alert.alert('Camera Error', result.error);
    }
  };

  const handlePickImage = async () => {
    const result = await pickImage();
    if (result.success) {
      setPhotoUris((prev) => [...prev, ...result.images.map((img) => img.uri)]);
    } else {
      Alert.alert('Image Error', result.error);
    }
  };

  const handleRemovePhoto = (index) => {
    setPhotoUris((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async () => {
    if (photoUris.length === 0) {
      setImageUrls([]);
      return;
    }

    try {
      setUploadBusy(true);
      const formData = new FormData();
      
      photoUris.forEach((uri, index) => {
        formData.append('files', {
          uri,
          type: 'image/jpeg',
          name: `photo_${index}.jpg`,
        });
      });

      const response = await fetch(`${API_URL}/upload_images`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const data = await response.json();
      setImageUrls(data.image_urls || []);
      setMessage(`Uploaded ${data.image_urls?.length || 0} image(s)`);
    } catch (error) {
      console.error('Upload error:', error);
      setMessage('Error uploading images');
      Alert.alert('Upload Error', error.message);
    } finally {
      setUploadBusy(false);
    }
  };

  const handleSubmit = () => {
    if (!formData.type_of_sighting || !formData.latitude || !formData.longitude) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }
    setShowUnitModal(true);
  };

  const handleUnitSelection = async (unitData) => {
    if (unitData.action === 'save') {
      await handleSaveForm(unitData);
      return;
    }

    try {
      const submissionData = {
        ...formData,
        time: new Date(formData.time).toISOString(),
        image_urls: imageUrls,
        ascc: unitData.ascc,
        unit: unitData.unit,
      };

      const response = await fetch(`${API_URL}/sightings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (response.ok) {
        setMessage('Sighting submitted successfully!');
        resetForm();
        fetchSightingsCount();
        Alert.alert('Success', 'Sighting submitted successfully!');
      } else {
        setMessage('Error submitting sighting');
        Alert.alert('Error', 'Failed to submit sighting');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error submitting sighting');
      Alert.alert('Error', error.message);
    }
  };

  const handleSaveForm = async (unitData) => {
    const formToSave = {
      ...formData,
      ascc: unitData.ascc,
      unit: unitData.unit,
      image_urls: imageUrls,
    };

    const saved = await saveForm(formToSave);
    if (saved) {
      setMessage('Form saved locally!');
      loadSavedFormsCount();
      resetForm();
      Alert.alert('Success', 'Form saved successfully!');
    } else {
      Alert.alert('Error', 'Failed to save form');
    }
  };

  const resetForm = () => {
    setFormData({
      type_of_sighting: '',
      time: getCurrentDateTime(),
      latitude: '',
      longitude: '',
      location_name: '',
      description: '',
      symbol_code: '',
    });
    setPhotoUris([]);
    setImageUrls([]);
    setMessage('');
  };

  const setCurrentTime = () => {
    setFormData((prev) => ({
      ...prev,
      time: getCurrentDateTime(),
    }));
  };

  return (
    <ScrollView style={styles.container}>
      {/* Dashboard Cards */}
      <View style={styles.dashboardCards}>
        <View style={styles.dashboardCard}>
          <Text style={styles.cardTitle}>TOTAL SIGHTINGS</Text>
          <Text style={styles.cardValue}>{sightingsCount}</Text>
        </View>
        <View style={styles.dashboardCard}>
          <Text style={styles.cardTitle}>PENDING REPORT</Text>
          <Text style={styles.cardValue}>{pendingReports}</Text>
        </View>
        <View style={styles.dashboardCard}>
          <Text style={styles.cardTitle}>SAVED FORMS</Text>
          <Text style={styles.cardValue}>{savedFormsCount}</Text>
        </View>
      </View>

      {/* Form */}
      <View style={styles.formContainer}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Type of Sighting:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.type_of_sighting}
              onValueChange={(value) => handleInputChange('type_of_sighting', value)}
              style={styles.picker}
            >
              <Picker.Item label="Select a type" value="" />
              {sightingTypeOptions.map((type, index) => (
                <Picker.Item key={index} label={type} value={type} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Time:</Text>
          <View style={styles.timeContainer}>
            <TextInput
              style={[styles.input, styles.timeInput]}
              value={formData.time}
              onChangeText={(value) => handleInputChange('time', value)}
              placeholder="YYYY-MM-DDTHH:MM"
            />
            <TouchableOpacity style={styles.nowButton} onPress={setCurrentTime}>
              <Text style={styles.nowButtonText}>Now</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Location:</Text>
          <View style={styles.locationContainer}>
            <TextInput
              style={[styles.input, styles.locationInput]}
              value={formData.location_name}
              onChangeText={(value) => handleInputChange('location_name', value)}
              placeholder="Enter location"
            />
            <TouchableOpacity
              style={styles.searchButton}
              onPress={handleSearchLocation}
              disabled={isLoading}
            >
              <Text style={styles.buttonLabel}>Search</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.gpsButton}
              onPress={handleUseCurrentLocation}
              disabled={isLoading}
            >
              <Text style={styles.buttonLabel}>GPS</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.coordinatesGroup}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Latitude:</Text>
            <TextInput
              style={styles.input}
              value={formData.latitude}
              onChangeText={(value) => handleInputChange('latitude', value)}
              placeholder="e.g., 49.4521"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Longitude:</Text>
            <TextInput
              style={styles.input}
              value={formData.longitude}
              onChangeText={(value) => handleInputChange('longitude', value)}
              placeholder="e.g., 7.5658"
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Description:</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.description}
            onChangeText={(value) => handleInputChange('description', value)}
            placeholder="Enter description"
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Pictures:</Text>
          <View style={styles.photoButtons}>
            <TouchableOpacity 
              style={styles.photoButton} 
              onPress={() => setShowImagePickerModal(true)}
            >
              <Text style={styles.photoButtonText}>Add Photo</Text>
            </TouchableOpacity>
          </View>

          {photoUris.length > 0 && (
            <View style={styles.photoPreview}>
              {photoUris.map((uri, index) => (
                <View key={index} style={styles.photoItem}>
                  <Image source={{ uri }} style={styles.photoThumbnail} />
                  <TouchableOpacity
                    style={styles.removePhotoButton}
                    onPress={() => handleRemovePhoto(index)}
                  >
                    <Icon name="close" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity
            style={styles.uploadButton}
            onPress={uploadImages}
            disabled={uploadBusy || photoUris.length === 0}
          >
            {uploadBusy ? (
              <ActivityIndicator color="#1a1a1a" />
            ) : (
              <Text style={styles.uploadButtonText}>Upload Selected</Text>
            )}
          </TouchableOpacity>

          {imageUrls.length > 0 && (
            <Text style={styles.uploadStatus}>
              Ready to attach {imageUrls.length} image(s)
            </Text>
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Symbol Code:</Text>
          <TextInput
            style={[styles.input, styles.readOnlyInput]}
            value={formData.symbol_code}
            placeholder="Auto-populated"
            editable={false}
          />
        </View>

        <View style={styles.buttonGroup}>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        </View>

        {message ? <Text style={styles.message}>{message}</Text> : null}
      </View>

      <UnitSelectionModal
        visible={showUnitModal}
        onClose={() => setShowUnitModal(false)}
        onSubmit={handleUnitSelection}
      />

      {/* Custom Image Picker Modal */}
      {showImagePickerModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.imagePickerModal}>
            <Text style={styles.modalTitle}>Select Photo Source</Text>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={async () => {
                setShowImagePickerModal(false);
                await handleTakePhoto();
              }}
            >
              <Icon name="camera-alt" size={24} color="#ffd700" />
              <Text style={styles.modalOptionText}>Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={async () => {
                setShowImagePickerModal(false);
                await handlePickImage();
              }}
            >
              <Icon name="photo-library" size={24} color="#ffd700" />
              <Text style={styles.modalOptionText}>Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setShowImagePickerModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  dashboardCards: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    gap: 10,
  },
  dashboardCard: {
    flex: 1,
    backgroundColor: '#2d2d2d',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#404040',
  },
  cardTitle: {
    fontSize: 10,
    color: '#cccccc',
    marginBottom: 5,
    letterSpacing: 0.5,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffd700',
  },
  formContainer: {
    backgroundColor: '#2d2d2d',
    padding: 20,
    margin: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#404040',
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
  input: {
    backgroundColor: '#404040',
    borderWidth: 1,
    borderColor: '#555555',
    borderRadius: 4,
    padding: 12,
    color: '#ffffff',
    fontSize: 14,
  },
  timeContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  timeInput: {
    flex: 1,
  },
  nowButton: {
    backgroundColor: '#404040',
    borderWidth: 1,
    borderColor: '#555555',
    borderRadius: 4,
    padding: 12,
  },
  nowButtonText: {
    color: '#ffffff',
    fontSize: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  locationInput: {
    flex: 1,
  },
  searchButton: {
    backgroundColor: '#ffd700',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
  },
  gpsButton: {
    backgroundColor: '#ffd700',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
  },
  buttonLabel: {
    color: '#1a1a1a',
    fontSize: 12,
    fontWeight: '600',
  },
  coordinatesGroup: {
    flexDirection: 'row',
    gap: 15,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  readOnlyInput: {
    backgroundColor: '#333333',
    color: '#999999',
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
  photoButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  photoButton: {
    flex: 1,
    backgroundColor: '#ffd700',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoButtonText: {
    color: '#1a1a1a',
    fontSize: 14,
    fontWeight: '600',
  },
  photoPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 10,
  },
  photoItem: {
    position: 'relative',
  },
  photoThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#dc3545',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadButton: {
    backgroundColor: '#ffd700',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 10,
  },
  uploadButtonText: {
    color: '#1a1a1a',
    fontSize: 14,
    fontWeight: '600',
  },
  uploadStatus: {
    color: '#cccccc',
    fontSize: 12,
  },
  buttonGroup: {
    marginTop: 20,
  },
  submitButton: {
    backgroundColor: '#ffd700',
    padding: 15,
    borderRadius: 4,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#1a1a1a',
    fontSize: 16,
    fontWeight: '600',
  },
  message: {
    backgroundColor: '#2d2d2d',
    borderWidth: 1,
    borderColor: '#404040',
    borderRadius: 4,
    padding: 15,
    marginTop: 20,
    color: '#ffffff',
    fontSize: 14,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  imagePickerModal: {
    backgroundColor: '#2d2d2d',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 300,
    borderWidth: 1,
    borderColor: '#404040',
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#404040',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#555555',
  },
  modalOptionText: {
    color: '#ffffff',
    fontSize: 16,
    marginLeft: 12,
    fontWeight: '500',
  },
  modalCancel: {
    marginTop: 10,
    padding: 15,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#404040',
  },
  modalCancelText: {
    color: '#cccccc',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default HomeScreen;

