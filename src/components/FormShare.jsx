import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import FormElement from './FormElement';
import styles from './FormShare.module.css';
import { 
  getSharedForm, 
  trackFormView, 
  startFormResponse, 
  updateFormResponse 
} from '../services/api';

const FormShare = () => {
  const { shareToken } = useParams();
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [responses, setResponses] = useState({});
  const [visibleElements, setVisibleElements] = useState([]);
  const [tempResponses, setTempResponses] = useState({});
  const [responseId, setResponseId] = useState(null);

  const chatEndRef = useRef(null);
  const hasStarted = useRef(false);
  const hasCompleted = useRef(false);

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const response = await getSharedForm(shareToken);
        setFormData(response);
        
        const sortedElements = response.elements.sort((a, b) => a.order - b.order);
        const initialElements = sortedElements.filter(element => 
          element.order === 0 || element.order === 1
        );
        
        setVisibleElements(initialElements);

        // Track form view
        await trackFormView(response._id);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (shareToken) {
      fetchFormData();
    }
  }, [shareToken]);

  useEffect(() => {
    const trackStart = async () => {
      if (formData?._id && Object.keys(responses).length > 0 && !hasStarted.current) {
        hasStarted.current = true;
        try {
          const { responseId: newResponseId } = await startFormResponse(formData._id);
          setResponseId(newResponseId);
        } catch (err) {
          console.error('Failed to track start:', err);
        }
      }
    };
    trackStart();
  }, [responses, formData]);

  useEffect(() => {
    const trackCompletion = async () => {
      if (!formData || !hasStarted.current || hasCompleted.current || !responseId) return;

      const totalElements = formData.elements.filter(el => 
        !['text-bubble', 'image-bubble'].includes(el.type)
      ).length;
      
      const answeredElements = Object.keys(responses).length;

      if (answeredElements === totalElements) {
        hasCompleted.current = true;
        try {
          await updateFormResponse(responseId, {
            responses,
            status: 'completed'
          },formData._id);
        } catch (err) {
          console.error('Failed to track completion:', err);
        }
      }
    };
    trackCompletion();
  }, [responses, formData, responseId]);

  const handleTempResponse = (elementId, value) => {
    setTempResponses(prev => ({
      ...prev,
      [elementId]: value
    }));
  };

  const handleSubmit = async (elementId) => {
    if (formData.elements.find(el => el._id === elementId)?.type === 'button-input') {
      try {
        await updateFormResponse(responseId, {
          responses: {
            ...responses,
            [elementId]: 'completed'
          },
          status: 'completed'
        }, formData._id);
        hasCompleted.current = true;
      } catch (err) {
        console.error('Failed to complete form:', err);
      }
      return;
    }
    const value = tempResponses[elementId];
    if (value === undefined) return;

    setResponses(prev => ({
      ...prev,
      [elementId]: value
    }));

    setTempResponses(prev => {
      const { [elementId]: removed, ...rest } = prev;
      return rest;
    });

    if (responseId) {
      try {
        await updateFormResponse(responseId, {
          responses: {
            ...responses,
            [elementId]: value
          }
        },formData._id);
      } catch (err) {
        console.error('Failed to update response:', err);
      }
    }

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

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!formData) return <div className={styles.error}>Form not found</div>;

  return (
    <div className={styles.chatContainer}>
      <div className={styles.messagesContainer}>
        {visibleElements.map((element) => (
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
        ))}
        <div ref={chatEndRef} />
      </div>
    </div>
  );
};

export default FormShare;