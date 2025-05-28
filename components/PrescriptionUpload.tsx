import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal, Image, ScrollView, TextInput } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { ArrowLeft, Camera as CameraIcon, Upload, X, ChevronDown, Brain, Check } from 'lucide-react-native';
import { supabase, getCurrentUser } from '../utils/supabase';

interface PrescriptionUploadProps {
  onUploadComplete: () => void;
  onCancel: () => void;
  medications: any[];
}

interface ExtractedMedication {
  name: string;
  dosage: string;
  frequency: string;
  prescribing_doctor: string;
  notes: string;
}

export default function PrescriptionUpload({ onUploadComplete, onCancel, medications }: PrescriptionUploadProps) {
  const [showCamera, setShowCamera] = useState(false);
  const [showMedicationPicker, setShowMedicationPicker] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState('');
  const [extractedMedications, setExtractedMedications] = useState<ExtractedMedication[]>([]);
  const [showExtractedMeds, setShowExtractedMeds] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  // Debug medications
  console.log('PrescriptionUpload medications:', medications);
  console.log('Medications length:', medications?.length || 0);

  // Analyze prescription with ElevenLabs
  const analyzePrescription = async () => {
    if (!capturedImage) {
      Alert.alert('Error', 'Please take a photo first');
      return;
    }

    setIsAnalyzing(true);
    try {
      // Convert image to base64
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        const base64Image = base64data.split(',')[1]; // Remove data:image/jpeg;base64, prefix
        
        try {
          // Call ElevenLabs API to analyze the prescription
          const analysisResponse = await fetch('https://api.elevenlabs.io/v1/convai/conversation', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'xi-api-key': process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY || '',
            },
            body: JSON.stringify({
              agent_id: process.env.EXPO_PUBLIC_ELEVENLABS_AGENT_ID || '',
              text: `Please analyze this prescription image and extract the following information for each medication:
              - Medication name
              - Dosage (amount and unit)
              - Frequency (how often to take)
              - Prescribing doctor name
              - Any special instructions or notes
              
              Please respond in JSON format like this:
              {
                "medications": [
                  {
                    "name": "medication name",
                    "dosage": "dosage amount",
                    "frequency": "frequency description",
                    "prescribing_doctor": "doctor name",
                    "notes": "any special instructions"
                  }
                ]
              }`,
              image: base64Image
            })
          });

          if (!analysisResponse.ok) {
            throw new Error('Failed to analyze prescription');
          }

          const analysisResult = await analysisResponse.json();
          
          // Parse the AI response to extract medication information
          let extractedData: ExtractedMedication[] = [];
          
          try {
            // Try to parse JSON response from AI
            const parsedResponse = JSON.parse(analysisResult.response || analysisResult.text || '{}');
            if (parsedResponse.medications && Array.isArray(parsedResponse.medications)) {
              extractedData = parsedResponse.medications;
            }
          } catch (parseError) {
            // If JSON parsing fails, try to extract information from text response
            console.log('JSON parsing failed, trying text extraction');
            // This is a fallback - you might want to implement more sophisticated text parsing
            extractedData = [{
              name: 'Extracted medication',
              dosage: 'Please verify dosage',
              frequency: 'Please verify frequency',
              prescribing_doctor: 'Please verify doctor',
              notes: analysisResult.response || analysisResult.text || 'Please review and edit'
            }];
          }

          setExtractedMedications(extractedData);
          setShowExtractedMeds(true);
          
        } catch (error) {
          console.error('Error analyzing prescription:', error);
          Alert.alert('Error', 'Failed to analyze prescription. Please try again or enter information manually.');
        }
      };
      
      reader.readAsDataURL(blob);
      
    } catch (error) {
      console.error('Error preparing image for analysis:', error);
      Alert.alert('Error', 'Failed to prepare image for analysis.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Save extracted medications to database
  const saveExtractedMedications = async () => {
    if (extractedMedications.length === 0) {
      Alert.alert('Error', 'No medications to save');
      return;
    }

    setIsUploading(true);
    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('Not authenticated');
      }

      // Save each extracted medication
      for (const med of extractedMedications) {
        if (med.name.trim()) {
          const { error } = await supabase.from('medications').insert({
            user_id: user.id,
            name: med.name,
            dosage: med.dosage,
            frequency: med.frequency,
            prescribing_doctor: med.prescribing_doctor || null,
            notes: med.notes || null,
            start_date: new Date().toISOString().split('T')[0] // Today's date
          });

          if (error) {
            console.error('Error saving medication:', error);
            throw error;
          }
        }
      }

      // Also upload the prescription image
      await uploadPrescriptionImage();
      
      Alert.alert('Success', `${extractedMedications.length} medication(s) added successfully!`);
      onUploadComplete();
      
    } catch (error) {
      console.error('Error saving medications:', error);
      Alert.alert('Error', 'Failed to save medications. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Update extracted medication
  const updateExtractedMedication = (index: number, field: keyof ExtractedMedication, value: string) => {
    setExtractedMedications(prev => 
      prev.map((med, i) => 
        i === index ? { ...med, [field]: value } : med
      )
    );
  };

  // Take a photo with camera
  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
        });
        if (photo) {
          setCapturedImage(photo.uri);
          setShowCamera(false);
        }
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'Failed to take picture. Please try again.');
      }
    }
  };

  // Pick image from gallery
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setCapturedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  // Upload image to Supabase (renamed from uploadPrescription)
  const uploadPrescriptionImage = async () => {
    if (!capturedImage) {
      Alert.alert('Error', 'Please take a photo first');
      return;
    }

    setIsUploading(true);
    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('Not authenticated');
      }

      // Generate unique filename
      const fileName = `prescription_${Date.now()}.jpg`;
      const filePath = `${user.id}/${fileName}`;

      // Convert image to blob for React Native
      const response = await fetch(capturedImage);
      const blob = await response.blob();

      // Upload to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('files')
        .upload(filePath, blob, {
          contentType: 'image/jpeg',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      console.log('Upload successful:', uploadData);

      // If medication is selected, link the document
      if (selectedMedication && uploadData) {
        console.log('Linking to medication:', selectedMedication);
        // Wait for the document to be processed
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const { data: documents } = await supabase
          .from('documents_with_storage_path')
          .select('id')
          .eq('storage_object_path', uploadData.path)
          .limit(1);
        
        console.log('Found documents:', documents);
        
        if (documents && documents.length > 0) {
          const documentId = documents[0].id;
          
          // Link document to medication
          const { error: linkError } = await supabase.rpc(
            'link_document_to_medication',
            {
              document_id: documentId, 
              medication_name: selectedMedication,
              user_id: user.id
            }
          );
          
          if (linkError) {
            console.error('Error linking medication:', linkError);
          } else {
            console.log('Successfully linked to medication');
          }
        }
      }

      Alert.alert('Success', 'Prescription uploaded successfully!');
      onUploadComplete();
    } catch (error) {
      console.error('Error uploading prescription:', error);
      Alert.alert('Error', 'Failed to upload prescription. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Open camera
  const openCamera = async () => {
    if (!permission) {
      // Camera permissions are still loading
      return;
    }

    if (!permission.granted) {
      // Camera permissions are not granted yet
      const response = await requestPermission();
      if (!response.granted) {
        Alert.alert('Permission Required', 'Camera permission is required to take photos.');
        return;
      }
    }

    setShowCamera(true);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onCancel}>
          <ArrowLeft size={24} color="#1E40AF" />
        </TouchableOpacity>
        <Text style={styles.title}>Upload Prescription</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {!capturedImage ? (
          <View style={styles.uploadSection}>
            <Text style={styles.instructionText}>
              Take a photo of your prescription or select from gallery
            </Text>
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.cameraButton} onPress={openCamera}>
                <CameraIcon size={32} color="#FFFFFF" />
                <Text style={styles.buttonText}>Take Photo</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.galleryButton} onPress={pickImage}>
                <Upload size={32} color="#3B82F6" />
                <Text style={styles.galleryButtonText}>Choose from Gallery</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : showExtractedMeds ? (
          <ScrollView style={styles.reviewSection}>
            <Text style={styles.reviewTitle}>Review Extracted Medications</Text>
            <Text style={styles.reviewSubtitle}>
              Please review and edit the information extracted from your prescription
            </Text>
            
            {extractedMedications.map((med, index) => (
              <View key={index} style={styles.medicationCard}>
                <Text style={styles.medicationCardTitle}>Medication {index + 1}</Text>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Medication Name *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={med.name}
                    onChangeText={(value) => updateExtractedMedication(index, 'name', value)}
                    placeholder="Enter medication name"
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Dosage</Text>
                  <TextInput
                    style={styles.textInput}
                    value={med.dosage}
                    onChangeText={(value) => updateExtractedMedication(index, 'dosage', value)}
                    placeholder="e.g., 10mg, 1 tablet"
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Frequency</Text>
                  <TextInput
                    style={styles.textInput}
                    value={med.frequency}
                    onChangeText={(value) => updateExtractedMedication(index, 'frequency', value)}
                    placeholder="e.g., Once daily, Twice a day"
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Prescribing Doctor</Text>
                  <TextInput
                    style={styles.textInput}
                    value={med.prescribing_doctor}
                    onChangeText={(value) => updateExtractedMedication(index, 'prescribing_doctor', value)}
                    placeholder="Doctor's name"
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Notes</Text>
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    value={med.notes}
                    onChangeText={(value) => updateExtractedMedication(index, 'notes', value)}
                    placeholder="Special instructions or notes"
                    multiline
                    numberOfLines={3}
                  />
                </View>
              </View>
            ))}
            
            <View style={styles.reviewActions}>
              <TouchableOpacity 
                style={styles.backToImageButton} 
                onPress={() => setShowExtractedMeds(false)}
              >
                <Text style={styles.backToImageButtonText}>Back to Image</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.saveMedicationsButton, isUploading && styles.disabledButton]} 
                onPress={saveExtractedMedications}
                disabled={isUploading}
              >
                <Check size={20} color="#FFFFFF" />
                <Text style={styles.saveMedicationsButtonText}>
                  {isUploading ? 'Saving...' : 'Save Medications'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        ) : (
          <View style={styles.previewSection}>
            <Text style={styles.previewTitle}>Prescription Preview</Text>
            <Image source={{ uri: capturedImage }} style={styles.previewImage} />
            
            {/* AI Analysis Section */}
            <View style={styles.aiSection}>
              <Text style={styles.aiSectionTitle}>AI Analysis</Text>
              <Text style={styles.aiSectionSubtitle}>
                Let our AI extract medication information from your prescription
              </Text>
              
              <TouchableOpacity 
                style={[styles.analyzeButton, isAnalyzing && styles.disabledButton]} 
                onPress={analyzePrescription}
                disabled={isAnalyzing}
              >
                <Brain size={24} color="#FFFFFF" />
                <Text style={styles.analyzeButtonText}>
                  {isAnalyzing ? 'Analyzing...' : 'Analyze with AI'}
                </Text>
              </TouchableOpacity>
            </View>
            
            {/* Manual Upload Section */}
            <View style={styles.manualSection}>
              <Text style={styles.manualSectionTitle}>Or Upload Manually</Text>
              
              {/* Medication Selection */}
              <View style={styles.medicationSection}>
                <Text style={styles.medicationLabel}>Link to Existing Medication (Optional)</Text>
                <TouchableOpacity 
                  style={styles.medicationPicker}
                  onPress={() => setShowMedicationPicker(true)}
                >
                  <Text style={styles.medicationButtonText}>
                    {selectedMedication || 'Select a medication (optional)'}
                  </Text>
                  <ChevronDown size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={styles.retakeButton} 
                  onPress={() => setCapturedImage(null)}
                >
                  <Text style={styles.retakeButtonText}>Retake</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.uploadButton, isUploading && styles.disabledButton]} 
                  onPress={uploadPrescriptionImage}
                  disabled={isUploading}
                >
                  <Text style={styles.uploadButtonText}>
                    {isUploading ? 'Uploading...' : 'Upload Only'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Camera Modal */}
      <Modal visible={showCamera} animationType="slide">
        <View style={styles.cameraContainer}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing="back"
          />
          <View style={styles.cameraOverlay}>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => setShowCamera(false)}
            >
              <X size={24} color="#FFFFFF" />
            </TouchableOpacity>
            
            <View style={styles.cameraControls}>
              <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                <View style={styles.captureButtonInner} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Medication Picker Modal */}
      <Modal visible={showMedicationPicker} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.medicationModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Medication</Text>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setShowMedicationPicker(false)}
              >
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.medicationList}>
              <TouchableOpacity 
                style={[
                  styles.medicationOption,
                  !selectedMedication && styles.medicationOptionSelected
                ]}
                onPress={() => {
                  setSelectedMedication('');
                  setShowMedicationPicker(false);
                }}
              >
                <Text style={[
                  styles.medicationOptionText,
                  !selectedMedication && styles.medicationOptionTextSelected
                ]}>
                  None (Don't link to medication)
                </Text>
              </TouchableOpacity>
              
              {medications.map((med) => (
                <TouchableOpacity 
                  key={med.id}
                  style={[
                    styles.medicationOption,
                    selectedMedication === med.name && styles.medicationOptionSelected
                  ]}
                  onPress={() => {
                    setSelectedMedication(med.name);
                    setShowMedicationPicker(false);
                  }}
                >
                  <Text style={[
                    styles.medicationOptionText,
                    selectedMedication === med.name && styles.medicationOptionTextSelected
                  ]}>
                    {med.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFF6FF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#DBEAFE',
    borderBottomWidth: 1,
    borderBottomColor: '#BFDBFE',
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E40AF',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  uploadSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 40,
  },
  buttonContainer: {
    width: '100%',
    gap: 20,
  },
  cameraButton: {
    backgroundColor: '#3B82F6',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  galleryButton: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  galleryButtonText: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '600',
  },
  previewSection: {
    flex: 1,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 16,
    textAlign: 'center',
  },
  previewImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    marginBottom: 20,
  },
  medicationSection: {
    marginBottom: 20,
  },
  medicationLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  medicationPicker: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: 'white',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  medicationButtonText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  retakeButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  retakeButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  uploadButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
  },
  cameraControls: {
    alignItems: 'center',
    paddingBottom: 50,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3B82F6',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  medicationModal: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    width: '80%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E40AF',
  },
  modalCloseButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  medicationList: {
    flex: 1,
  },
  medicationOption: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    marginBottom: 8,
  },
  medicationOptionSelected: {
    backgroundColor: '#3B82F6',
  },
  medicationOptionText: {
    fontSize: 16,
    color: '#374151',
  },
  medicationOptionTextSelected: {
    fontWeight: 'bold',
    color: 'white',
  },
  reviewSection: {
    flex: 1,
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 16,
    textAlign: 'center',
  },
  reviewSubtitle: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 20,
  },
  medicationCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  medicationCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
  },
  textArea: {
    height: 100,
  },
  reviewActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  backToImageButton: {
    flex: 1,
    marginRight: 8,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  backToImageButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  saveMedicationsButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: '#10B981',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  saveMedicationsButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  aiSection: {
    marginBottom: 20,
  },
  aiSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 8,
  },
  aiSectionSubtitle: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 16,
  },
  analyzeButton: {
    backgroundColor: '#3B82F6',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  analyzeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  manualSection: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 20,
  },
  manualSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 16,
    textAlign: 'center',
  },
}); 