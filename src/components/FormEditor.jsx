import React, { useState, useEffect } from 'react';
import { X, Trash2, Loader2 } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useParams } from 'react-router-dom';
import styles from './FormEditor.module.css';
import { useNavigate } from 'react-router-dom';
import { 
  getFormElements, 
  addFormElements, 
  updateFormElement, 
  deleteFormElement, 
  reorderFormElements, getExistingElementIds, createShareLink  
} from '../services/api';
import FormShare from './FormShare';
import FormAnalytics from './FormAnalytics';
import textBubbleImg from '../assets/chat.png';
import imageBubbleImg from '../assets/pic.png';
import videoBubbleImg from '../assets/movie.png';
import gifBubbleImg from '../assets/gif.png';
import textInputImg from '../assets/text.png';
import numberInputImg from '../assets/hash.png';
import emailInputImg from '../assets/atd.png';
import phoneInputImg from '../assets/call.png';
import dateInputImg from '../assets/date.png';
import ratingInputImg from '../assets/star.png';
import buttonInputImg from '../assets/tick.png';
import close from '../assets/close.png';
const FormEditor = () => {
  
  const { formbotId } = useParams();
  const [activeTab, setActiveTab] = useState('Flow');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [formElements, setFormElements] = useState([]);
  const [formName, setFormName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [shareUrl, setShareUrl] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const loadFormElements = async () => {
      if (!formbotId) {
        setIsLoading(false);
        setError('No form ID provided');
        return;
      }
  
      try {
        setIsLoading(true);
        setError(null);
        
        const elements = await getFormElements(formbotId);
        const transformedElements = elements.map(element => {
          // Ensure we have a valid ID - log the incoming data
          console.log('Raw element from server:', element);
          
          // Check if the ID exists in _id or id field
          const elementId = element._id || element.id;
          if (!elementId) {
            console.error('Element missing ID:', element);
          }
          
          return {
            id: elementId, // Use the determined ID
            type: element.type,
            label: element.label,
            value: element.value || '',
            icon: element.icon,
            required: element.required || false,
            category: element.type.includes('bubble') ? 'Bubbles' : 'Inputs'
          };
        });
        
        // Log transformed elements
        console.log('Transformed elements:', transformedElements);
        setFormElements(transformedElements);
      } catch (error) {
        console.error('Error loading form elements:', error);
        setError('Failed to load form elements');
      } finally {
        setIsLoading(false);
      }
    };
  
    loadFormElements();
  }, [formbotId]);

  const bubbleElements = [
    { 
      id: 'text-bubble', 
      icon: textBubbleImg, 
      label: "Text", 
      category: "Bubbles", 
      type: 'text-bubble' 
    },
    { 
      id: 'image-bubble', 
      icon: imageBubbleImg, 
      label: "Image", 
      category: "Bubbles", 
      type: 'image-bubble' 
    },
    { 
      id: 'video-bubble', 
      icon: videoBubbleImg, 
      label: "Video", 
      category: "Bubbles", 
      type: 'video-bubble' 
    },
    { 
      id: 'gif-bubble', 
      icon: gifBubbleImg, 
      label: "GIF", 
      category: "Bubbles", 
      type: 'gif-bubble' 
    },
    { 
      id: 'text-input', 
      icon: textInputImg, 
      label: "Text", 
      category: "Inputs", 
      type: 'text-input' 
    },
    { 
      id: 'number-input', 
      icon: numberInputImg, 
      label: "Number", 
      category: "Inputs", 
      type: 'number-input' 
    },
    { 
      id: 'email-input', 
      icon: emailInputImg, 
      label: "Email", 
      category: "Inputs", 
      type: 'email-input' 
    },
    { 
      id: 'phone-input', 
      icon: phoneInputImg, 
      label: "Phone", 
      category: "Inputs", 
      type: 'phone-input' 
    },
    { 
      id: 'date-input', 
      icon: dateInputImg, 
      label: "Date", 
      category: "Inputs", 
      type: 'date-input' 
    },
    { 
      id: 'rating-input', 
      icon: ratingInputImg, 
      label: "Rating", 
      category: "Inputs", 
      type: 'rating-input' 
    },
    { 
      id: 'button-input', 
      icon: buttonInputImg, 
      label: "Buttons", 
      category: "Inputs", 
      type: 'button-input' 
    }
  ];
  const isLastElementButton = () => {
    if (formElements.length === 0) return false;
    const lastElement = formElements[formElements.length - 1];
    return lastElement.type === 'button-input';
  };

  const handleElementDelete = async (elementId) => {
    // Log the incoming parameters
    console.log('Delete attempt:', { formbotId, elementId });
    
    if (!formbotId) {
      console.error('Missing formbotId');
      setError('Form ID is required');
      return;
    }
    
    if (!elementId) {
      console.error('Missing elementId');
      setError('Element ID is required');
      return;
    }
  
    try {
      // Find the element to be deleted
      const elementToDelete = formElements.find(el => el.id === elementId);
      console.log('Element to delete:', elementToDelete);
      
      if (!elementToDelete) {
        console.error('Element not found:', elementId);
        setError('Element not found');
        return;
      }
  
      // Optimistically update UI
      setFormElements(prev => prev.filter(element => element.id !== elementId));
      
      // Make API call
      await deleteFormElement(formbotId, elementId);
    } catch (error) {
      console.error('Delete operation failed:', error);
      setError('Failed to delete element');
      
      // Reload elements to ensure consistency
      try {
        const elements = await getFormElements(formbotId);
        const transformedElements = elements.map(element => ({
          id: element._id || element.id,
          type: element.type,
          label: element.label,
          value: element.value || '',
          icon: element.icon,
          required: element.required || false,
          category: element.type.includes('bubble') ? 'Bubbles' : 'Inputs'
        }));
        setFormElements(transformedElements);
      } catch (reloadError) {
        console.error('Error reloading elements:', reloadError);
        setError('Failed to reload elements');
      }
    }
  };
  const onDragEnd = async (result) => {
    const { source, destination } = result;
    
    // Validate drag and drop operation
    if (!destination || !formbotId) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;
  
    try {
      if (source.droppableId === 'SIDEBAR' && destination.droppableId === 'CANVAS') {
        // Handle dropping from sidebar to canvas
        const newElement = bubbleElements.find(element => element.id === result.draggableId);
        if (!newElement) return;
  
        const elementToAdd = {
          ...newElement,
          id: `temp-${Date.now()}`, // Temporary ID until server responds
          value: ''
        };
  
        // Update UI optimistically
        setFormElements(prev => {
          const newElements = Array.from(prev);
          newElements.splice(destination.index, 0, elementToAdd);
          return newElements;
        });
  
        try {
          // Make API call to add new element
          const response = await addFormElements(formbotId, [elementToAdd]);
          
          // Update with server response
          setFormElements(prev => {
            const newElements = Array.from(prev);
            // Replace temp ID with server-generated ID
            const index = newElements.findIndex(el => el.id === elementToAdd.id);
            if (index !== -1) {
              newElements[index] = {
                ...newElements[index],
                id: response[0]._id || response[0].id
              };
            }
            return newElements;
          });
        } catch (error) {
          console.error('Error adding new element:', error);
          // Revert optimistic update
          setFormElements(prev => prev.filter(el => el.id !== elementToAdd.id));
          setError('Failed to add new element');
        }
      } else if (source.droppableId === 'CANVAS' && destination.droppableId === 'CANVAS') {
        // Handle reordering within canvas
        const newElements = Array.from(formElements);
        const [removed] = newElements.splice(source.index, 1);
        newElements.splice(destination.index, 0, removed);
        
        // Update UI optimistically
        setFormElements(newElements);
  
        try {
          // Extract IDs in new order, ensuring each element has an ID
          const orderedIds = newElements.map(element => {
            const id = element._id || element.id;
            if (!id) throw new Error('Invalid element ID');
            return id;
          });
  
          // Make API call
          await reorderFormElements(formbotId, orderedIds);
        } catch (error) {
          console.error('Reorder operation failed:', error);
          // Reload original order on error
          const elements = await getFormElements(formbotId);
          if (!elements) throw new Error('Failed to reload elements');
          
          const transformedElements = elements.map(element => ({
            id: element._id || element.id,
            type: element.type,
            label: element.label,
            value: element.value || '',
            icon: element.icon,
            required: element.required || false,
            category: element.type.includes('bubble') ? 'Bubbles' : 'Inputs'
          }));
          setFormElements(transformedElements);
        }
      }
    } catch (error) {
      console.error('Error during drag and drop:', error);
      setError('Failed to update elements');
      
      // Reload all elements to ensure consistency
      try {
        const elements = await getFormElements(formbotId);
        if (!elements) throw new Error('Failed to reload elements');
        
        const transformedElements = elements.map(element => ({
          id: element._id || element.id,
          type: element.type,
          label: element.label,
          value: element.value || '',
          icon: element.icon,
          required: element.required || false,
          category: element.type.includes('bubble') ? 'Bubbles' : 'Inputs'
        }));
        setFormElements(transformedElements);
      } catch (reloadError) {
        console.error('Error reloading elements:', reloadError);
        setError('Failed to reload elements');
      }
    }
  };
  
  const renderElementContent = (element) => {
    // Validate element has required properties
    if (!element || !element.id) {
      console.error('Invalid element:', element);
      return null;
    }

    console.log('Rendering content for element:', element);
  
    if (element.category === "Bubbles" || element.type?.includes('bubble')) {
      return (
        <input
          type="text"
          className={styles.elementInput}
          placeholder="Click here to edit"
          value={element.value || ""}
          onChange={(e) => {
            const newValue = e.target.value;
            console.log('Value change:', {
              elementId: element.id,
              newValue
            });
            handleElementValueChange(element.id, newValue);
          }}
        />
      );
    }
    return null;
  };

  const handleElementValueChange = async (elementId, newValue) => {
    // Add validation for elementId
    if (!formbotId || !elementId) {
      console.error('Missing required IDs:', { formbotId, elementId });
      setError('Missing required information for update');
      return;
    }

    try {
      // Log the update attempt
      console.log('Updating element:', { formbotId, elementId, newValue });

      // Optimistically update UI
      setFormElements(prev => 
        prev.map(element => 
          element.id === elementId ? { ...element, value: newValue } : element
        )
      );
     
      // Make API call with explicit ID check
      const updatedElement = await updateFormElement(formbotId, elementId, { value: newValue });
      
      if (!updatedElement) {
        throw new Error('No response from server');
      }

      // Update with server response
      setFormElements(prev => 
        prev.map(element => 
          element.id === elementId ? {
            ...element,
            ...updatedElement,
            id: updatedElement._id || updatedElement.id // Ensure we have a valid ID
          } : element
        )
      );
    } catch (error) {
      console.error('Error updating element:', error);
      setError('Failed to update element');
      
      // Reload elements from API to ensure consistency
      try {
        const elements = await getFormElements(formbotId);
        const transformedElements = elements.map(element => ({
          id: element._id || element.id,
          type: element.type,
          label: element.label,
          value: element.value || '',
          icon: element.icon,
          required: element.required || false,
          category: element.type.includes('bubble') ? 'Bubbles' : 'Inputs'
        }));
        setFormElements(transformedElements);
      } catch (reloadError) {
        console.error('Error reloading elements:', reloadError);
        setError('Failed to reload elements');
      }
    }
  };
  const handleSave = async () => {
    if (!formbotId) {
      setError('No form ID provided');
      return;
    }
  
    setIsSaving(true);
    try {
      // Get existing element IDs
      const existingIds = await getExistingElementIds(formbotId);
      
      // Filter out elements that already exist
      const newElements = formElements.filter(element => {
        const elementId = element._id || element.id;
        return !existingIds.includes(elementId);
      });
  
      // Only save if there are new elements
      if (newElements.length > 0) {
        const elementsToSave = newElements.map((element, index) => ({
          type: element.type,
          label: element.label,
          value: element.value || '',
          icon: element.icon,
          required: element.required,
          order: formElements.length - newElements.length + index // Preserve ordering
        }));
  
        await addFormElements(formbotId, elementsToSave);
      }
  
      // Update any modified existing elements
      const existingElements = formElements.filter(element => {
        const elementId = element._id || element.id;
        return existingIds.includes(elementId);
      });
  
      // Update existing elements in parallel
      await Promise.all(
        existingElements.map(element => 
          updateFormElement(formbotId, element._id || element.id, {
            value: element.value,
            required: element.required,
            order: formElements.indexOf(element)
          })
        )
      );
  
    } catch (error) {
      console.error('Error saving form:', error);
      setError('Failed to save form');
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    if (!formbotId) {
      setError('No form ID provided');
      return;
    }

    setIsSaving(true); // Reuse the saving state for loading indication
    try {
      const shareUrl = await createShareLink(formbotId);
      setShareUrl(shareUrl);
      
      // Optional: Copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
      
      // You might want to show a success message
      alert('Share link copied to clipboard!');
    } catch (error) {
      console.error('Error generating share link:', error);
      setError('Failed to generate share link');
    } finally {
      setIsSaving(false);
    }
  };

  const renderSaveButton = () => {
    const isDisabled = !isLastElementButton();
    
    return (
      <div 
        className={styles.saveButtonContainer}
        onMouseEnter={() => setShowMessage(true)}
        onMouseLeave={() => setShowMessage(false)}
      >
        <button 
          className={`${styles.saveButton} ${isDisabled ? styles.saveButtonDisabled : ''}`}
          onClick={handleSave}
          disabled={isSaving || isDisabled}
        >
          {isSaving ? <Loader2 className={styles.spinner} size={16} /> : 'Save'}
        </button>
        
        {isDisabled && showMessage && (
          <div 
            className={styles.saveButtonMessage}
            style={{ display: showMessage ? 'block' : 'none' }}
          >
            Please add a Button element at the end to enable saving
          </div>
        )}
      </div>
    );
  };

  const renderCanvasElements = () => {
    return formElements.map((element, index) => {
      const elementId = element.id || element._id;
      
      // Skip rendering if no valid ID exists
      if (!elementId) {
        console.error('Element missing ID:', element);
        return null;
      }
      const bubbleElement = bubbleElements.find(be => be.type === element.type);
      const iconSrc = bubbleElement ? bubbleElement.icon : null;
      return (
        <React.Fragment key={elementId}>
          <div className={styles.connector} />
          <Draggable 
            draggableId={elementId.toString()} 
            index={index}
          >
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                className={`${styles.droppedElement} ${snapshot.isDragging ? styles.dragging : ''}`}
                style={provided.draggableProps.style}
              >
                <div className={styles.elementHeader}>
                  {iconSrc && (
                    <img 
                      src={iconSrc} 
                      alt={element.label} 
                      className={styles.elementIcon}
                    />
                  )}
                 
                  <span>{element.label}</span>
                  <button 
                    className={styles.deleteButton}
                    onClick={() => {
                      if (elementId) {
                        handleElementDelete(elementId);
                      }
                    }}
                    data-testid={`delete-${elementId}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                {renderElementContent(element)}
                <div className={styles.required}>
                  Required Field
                </div>
              </div>
            )}
          </Draggable>
        </React.Fragment>
      );
    }).filter(Boolean); // Remove any null elements
  };
  
  const renderSidebarElements = (category) => {
    const categoryElements = bubbleElements.filter(element => element.category === category);
    return categoryElements.map((element, index) => (
      <Draggable
        key={element.id}
        draggableId={element.id}
        index={categoryElements.length + index}
      >
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`${styles.element} ${snapshot.isDragging ? styles.dragging : ''}`}
            style={provided.draggableProps.style}
          >
            <img 
              src={element.icon} 
              alt={element.label} 
              className={styles.elementIcon}
            />
            <span>{element.label}</span>
          </div>
        )}
      </Draggable>
    ));
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 className={styles.spinner} size={40} />
        <p>Loading form elements...</p>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${isDarkMode ? styles.dark : styles.light}`}>
      <header className={styles.header}>
        <input
          type="text"
          placeholder="Enter Form Name"
          value={formName}
          onChange={(e) => setFormName(e.target.value)}
          className={styles.formNameInput}
        />
        <div className={styles.controlsContainer}>
          <div className={styles.tabGroup}>
            <button
              className={`${styles.tab} ${activeTab === 'Flow' ? styles.tabActive : styles.tabInactive}`}
              onClick={() => setActiveTab('Flow')}
            >
              Flow
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'Response' ? styles.tabActive : styles.tabInactive}`}
              onClick={() => setActiveTab('Response')}
            >
              Response
            </button>
          </div>
          
          <div className={styles.themeToggle}>
            <span>Light</span>
            <button
              className={`${styles.toggleButton} ${isDarkMode ? styles.toggleButtonActive : ''}`}
              onClick={() => setIsDarkMode(!isDarkMode)}
            >
              <div className={`${styles.toggleHandle} ${isDarkMode ? styles.toggleHandleActive : ''}`} />
            </button>
            <span>Dark</span>
          </div>
          
          <button 
            className={`${styles.actionButton} ${styles.shareButton}`}
            onClick={handleShare}
            disabled={isSaving}
          >
            {isSaving ? <Loader2 className={styles.spinner} size={16} /> : 'Share'}
          </button>
        
          {renderSaveButton()}
          <button className={styles.closeButton} onClick={() => navigate('/workspace')}>
            <img src ={close} alt="Close" />
          </button>
        </div>
      </header>

      {activeTab === 'Response' ? (
        <FormAnalytics formId={formbotId} isDarkMode={isDarkMode} />
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <main className={styles.main}>
            <Droppable droppableId="SIDEBAR" isDropDisabled={true}>
              {(provided, snapshot) => (
                <aside 
                  className={styles.sidebar}
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {['Bubbles', 'Inputs'].map((category) => (
                    <div key={category} className={styles.category}>
                      <h3 className={styles.categoryTitle}>{category}</h3>
                      <div className={styles.elementGrid}>
                        {renderSidebarElements(category)}
                      </div>
                    </div>
                  ))}
                  {provided.placeholder}
                </aside>
              )}
            </Droppable>

            <Droppable droppableId="CANVAS">
              {(provided, snapshot) => (
                <section 
                  className={styles.canvas}
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  <div className={styles.canvasContent}>
                    <div className={styles.startNode}>
                      <span className={styles.startIcon}>▶</span>
                      <span>Start</span>
                    </div>
                    {renderCanvasElements()}
                    {provided.placeholder}
                  </div>
                </section>
              )}
            </Droppable>
          </main>
        </DragDropContext>
      )}
      
      {error && (
        <div className={styles.errorBanner}>
          <p>{error}</p>
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}
    </div>
  );
};

export default FormEditor;