import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import FormElement from './FormElement';
import styles from './FormShare.module.css';
import { getSharedForm } from '../services/api';

const FormShare = () => {
  const { shareToken } = useParams();
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [responses, setResponses] = useState({});
  const [visibleElements, setVisibleElements] = useState([]);
  const [tempResponses, setTempResponses] = useState({});
  const chatEndRef = useRef(null);

  // Fetch initial data
  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const response = await getSharedForm(shareToken);
        console.log('API Response:', response);
        setFormData(response);
        
        // Sort elements by order
        const sortedElements = response.elements.sort((a, b) => a.order - b.order);
        console.log('Sorted Elements:', sortedElements);
        
        // Show initial elements (order 0 and 1)
        const initialElements = sortedElements.filter(element => 
          element.order === 0 || element.order === 1
        );
        console.log('Initial Visible Elements:', initialElements);
        
        setVisibleElements(initialElements);
      } catch (err) {
        console.error('API Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (shareToken) {
      console.log('Fetching data with shareToken:', shareToken);
      fetchFormData();
    }
  }, [shareToken]);

  // Handle input changes
  const handleTempResponse = (elementId, value) => {
    console.log('Temp Response Update:', { elementId, value });
    setTempResponses(prev => ({
      ...prev,
      [elementId]: value
    }));
  };
  useEffect(() => {
    if (!formData || !visibleElements.length) return;

    const lastElement = visibleElements[visibleElements.length - 1];
    
    // Auto-progress for bubble types after they're displayed
    if (['text-bubble', 'image-bubble'].includes(lastElement.type)) {
      const nextOrder = lastElement.order + 1;
      const nextElements = formData.elements.filter(el => el.order === nextOrder);
      
      if (nextElements.length > 0) {
        setTimeout(() => {
          setVisibleElements(prev => {
            const existingIds = new Set(prev.map(el => el._id));
            const newElements = nextElements.filter(el => !existingIds.has(el._id));
            return [...prev, ...newElements];
          });
        }, 1000); // Delay to allow for reading/viewing
      }
    }
  }, [visibleElements, formData]);

  // Modify handleSubmit to include a callback
  const handleSubmit = (elementId) => {
    console.log('Submit clicked for element:', elementId);
    const value = tempResponses[elementId];
    
    if (value === undefined) return;

    setResponses(prev => ({
      ...prev,
      [elementId]: value
    }));

    // Clear temp response
    setTempResponses(prev => {
      const { [elementId]: removed, ...rest } = prev;
      return rest;
    });

    // Find and show next elements
    const currentElement = formData.elements.find(el => el._id === elementId);
    if (!currentElement) return;

    const nextOrder = currentElement.order + 1;
    const nextElements = formData.elements.filter(el => el.order === nextOrder);

    if (nextElements.length > 0) {
      setTimeout(() => {
        setVisibleElements(prev => {
          const existingIds = new Set(prev.map(el => el._id));
          const newElements = nextElements.filter(el => !existingIds.has(el._id));
          return [...prev, ...newElements];
        });
      }, 500);
    }
  };
 

  // Log state changes
  useEffect(() => {
    console.log('Form Data Updated:', formData);
  }, [formData]);

  useEffect(() => {
    console.log('Visible Elements Updated:', visibleElements);
  }, [visibleElements]);

  useEffect(() => {
    console.log('Responses Updated:', responses);
  }, [responses]);

  useEffect(() => {
    console.log('Temp Responses Updated:', tempResponses);
  }, [tempResponses]);

  if (loading) {
    return (
      <div className={styles.chatContainer}>
        <div className={styles.loadingState}>Loading...</div>
      </div>
    );
  }

  if (error) {
    console.error('Rendering error state:', error);
    return (
      <div className={styles.chatContainer}>
        <div className={styles.errorState}>{error}</div>
      </div>
    );
  }

  if (!formData) {
    console.log('No form data available');
    return (
      <div className={styles.chatContainer}>
        <div className={styles.errorState}>Form not found</div>
      </div>
    );
  }

  return (
    <div className={styles.chatContainer}>
      <div className={styles.messagesContainer}>
        {visibleElements.map((element) => {
          console.log('Rendering element:', element);
          return (
            <div 
              key={element._id}
              className={`${styles.messageWrapper} ${
                ['text-bubble', 'image-bubble'].includes(element.type) 
                  ? styles.botMessage 
                  : styles.userInputWrapper
              }`}
            >
              {['text-bubble', 'image-bubble'].includes(element.type) && (
                <div className={styles.botAvatar}>
                  <svg viewBox="0 0 24 24" className={styles.avatarIcon}>
                    <circle cx="12" cy="12" r="12" fill="#2563eb" />
                  </svg>
                </div>
              )}
              <FormElement
                element={element}
                response={responses[element._id] || tempResponses[element._id]}
                onResponse={handleTempResponse}
                onSubmit={handleSubmit}
                isSubmitted={!!responses[element._id]}
              />
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>
    </div>
  );
};

export default FormShare;