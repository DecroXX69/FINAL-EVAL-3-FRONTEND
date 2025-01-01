import React from 'react';
import styles from './FormElement.module.css';

const FormElement = ({ 
  element, 
  response, 
  onResponse, 
  onSubmit, 
  isSubmitted 
}) => {
  const handleSubmitClick = () => {
    onSubmit(element._id);
  };

  const renderSubmitButton = () => (
    <button 
      className={styles.submitButton}
      onClick={handleSubmitClick}
      type="button"
      disabled={isSubmitted}
    >
      <svg 
        className={styles.submitIcon} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M9 5l7 7-7 7"
        />
      </svg>
    </button>
  );

  const renderResponseBubble = () => (
    <div className={styles.userResponseBubble}>
      {response}
    </div>
  );

  const renderInput = () => {
    // If response is submitted, show response bubble instead of input
    if (isSubmitted) {
      return renderResponseBubble();
    }

    switch (element.type) {
      case 'number-input':
        return (
          <div className={styles.inputWrapper}>
            <input
              type="number"
              className={styles.input}
              placeholder={element.label}
              value={response || ''}
              onChange={(e) => onResponse(element._id, e.target.value)}
              required={element.required}
            />
            {renderSubmitButton()}
          </div>
        );

      case 'text-bubble':
        return (
          <div className={styles.bubble}>
            <p>{element.value || element.label}</p>
          </div>
        );

      case 'image-bubble':
        return (
          <div className={`${styles.bubble} ${styles.imageBubble}`}>
            {element.imageUrl && (
              <img 
                src={element.imageUrl} 
                alt={element.label} 
                className={styles.bubbleImage}
              />
            )}
            <p>{element.label}</p>
          </div>
        );

      case 'rating-input':
        return (
          <div className={styles.inputWrapper}>
            <div className={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  className={`${styles.ratingButton} ${
                    response === rating ? styles.active : ''
                  }`}
                  onClick={() => onResponse(element._id, rating)}
                  type="button"
                >
                  {element.icon || rating}
                </button>
              ))}
            </div>
            {renderSubmitButton()}
          </div>
        );

      case 'phone-input':
        return (
          <div className={styles.inputWrapper}>
            <input
              type="tel"
              className={styles.input}
              placeholder={element.label}
              value={response || ''}
              onChange={(e) => onResponse(element._id, e.target.value)}
              required={element.required}
            />
            {renderSubmitButton()}
          </div>
        );

      case 'text-input':
        return (
          <div className={styles.inputWrapper}>
            <input
              type="text"
              className={styles.input}
              placeholder={element.label}
              value={response || ''}
              onChange={(e) => onResponse(element._id, e.target.value)}
              required={element.required}
            />
            {renderSubmitButton()}
          </div>
        );
        case 'date-input':
          return (
            <div className={styles.inputWrapper}>
              <input
                type="date"
                className={styles.input}
                placeholder={element.label}
                value={response || ''}
                onChange={(e) => onResponse(element._id, e.target.value)}
                required={element.required}
              />
              {renderSubmitButton()}
            </div>
          );
  
        case 'email-input':
          return (
            <div className={styles.inputWrapper}>
              <input
                type="email"
                className={styles.input}
                placeholder={element.label}
                value={response || ''}
                onChange={(e) => onResponse(element._id, e.target.value)}
                required={element.required}
              />
              {renderSubmitButton()}
            </div>
          );
  
        case 'button':
          return (
            <div className={styles.buttonWrapper}>
              <button
                className={styles.button}
                onClick={() => onResponse(element._id, element.value)}
                type="button"
              >
                {element.value || element.label}
              </button>
            </div>
          );
  
        default:
          return <div className={styles.error}>Unsupported element type: {element.type}</div>;
      }
    };
  
    return (
      <div className={styles.elementWrapper}>
        {element.icon && <span className={styles.elementIcon}>{element.icon}</span>}
        {renderInput()}
      </div>
    );
  };
  
  export default FormElement;