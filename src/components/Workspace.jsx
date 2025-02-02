import React, { useState, useEffect, useRef } from 'react';
import { Plus, X, ChevronDown, ChevronUp,Copy, Check } from 'lucide-react';
import styles from './Workspace.module.css';
import { getWorkspace, getUserWorkspaces, addFolder, deleteFolder, addFormbotToFolder, addFormbot, deleteFormbot, shareWorkspace,addSharedWorkspace} from '../services/api';
import { useNavigate, useLocation } from 'react-router-dom';
import  Settings  from './Settings';
import Folder from '../assets/Folder.png';
import Delete from '../assets/Delete.png';
import close from '../assets/close.png';

const Modal = ({ title, value, onChange, onClose, onSubmit, placeholder }) => (
  <div className={styles.modalOverlay}>
    <div className={styles.modal}>
      <h2 className={styles.modalTitle}>{title}</h2>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={styles.modalInput}
      />
      <div className={styles.modalActions}>
      <button onClick={onSubmit} className={styles.submitButton}>Done</button>
        
        <span></span>
        <button onClick={onClose} className={styles.cancelButton}>Cancel</button>
      </div>
    </div>
  </div>
);

const DeleteConfirmationModal = ({ type, onClose, onConfirm }) => (
  <div className={styles.modalOverlay}>
    <div className={styles.modal}>
      <h2 className={styles.modalTitle}>
        Are you sure you want to delete this {type}?
      </h2>
      <div className={styles.modalActions}>
        <button onClick={onConfirm} className={styles.submitButton}>Confirm</button>
        <span></span>
        <button onClick={onClose} className={styles.cancelButton}>Cancel</button>
      </div>
    </div>
  </div>
);

const FormbotGrid = ({ forms, onDelete, onCreate, navigate, hasEditPermissions }) => (
  <div className={styles.grid}>
    {hasEditPermissions && (
      <button onClick={onCreate} className={styles.createFormButton}>
        <Plus size={24} />
        <span>Create a Typebot</span>
      </button>
    )}
    {forms.map((form) => (
      <div 
        key={form.id} 
        className={styles.formCard}
        onClick={() => {
          // Always allow viewing the form
          if (form.id) {
            navigate(`/form-editor/${form.id}`);
          }
        }}
        style={{ cursor: 'pointer' }}
      >
        <span className={styles.formName}>{form.name}</span>
        {hasEditPermissions && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              if (form.id) {
                onDelete(form.id);
              }
            }} 
            className={styles.deleteButton}
          >
            <img src={Delete} alt="Delete Form" className={styles.deleteIcon} />
          </button>
        )}
      </div>
    ))}
  </div>
);



  const ShareModal = ({ onClose, onShare, email, setEmail, permissions, setPermissions, workspaceId }) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [inviteLink, setInviteLink] = useState('');
    const [copied, setCopied] = useState(false);
    
    useEffect(() => {
      const workspaceid = localStorage.getItem('workspaceId');
      // Ensure permissions are lowercase for consistency
      const permissionsLower = permissions.toLowerCase();
      const link = `${window.location.origin}/workspace/share/${workspaceid}?permissions=${permissionsLower}`;
      setInviteLink(link);
    }, [workspaceId, permissions]); // Add permissions as dependency to update link when permissions change
  
    const handleCopyLink = async () => {
      try {
        await navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy:', error);
      }
    };
    
    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modal}>
          <div className={styles.modalHeader}>
            <h2>Invite by Email</h2>
            <div className={styles.headerActions}>
              <div className={styles.dropdownContainer}>
                <button onClick={() => setShowDropdown(!showDropdown)} className={styles.editButton}>
                  {permissions}
                  <ChevronDown size={16} />
                </button>
                {showDropdown && (
                  <div className={styles.dropdownMenu}>
                    <button onClick={() => { setPermissions('Edit'); setShowDropdown(false); }} className={styles.dropdownItem}>Edit</button>
                    <button onClick={() => { setPermissions('View'); setShowDropdown(false); }} className={styles.dropdownItem}>View</button>
                  </div>
                )}
              </div>
              <button onClick={onClose} className={styles.closeButton}><img src={close} alt="Close" /></button>
            </div>
          </div>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter email id" className={styles.modalInput} />
          <button onClick={onShare} className={styles.blueButton}>Send Invite</button>
          <div className={styles.divider}><h2>Invite by link</h2></div>
          {/* <div className={styles.linkContainer}>
            <input type="text" value={inviteLink} readOnly className={styles.linkInput} />
            <button onClick={handleCopyLink} className={styles.copyButton}>
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div> */}
          <button onClick={handleCopyLink} className={styles.blueButton}>
            {copied ? 'Link Copied!' : 'Copy Link'}
          </button>
        </div>
      </div>
    );
  };

const Workspace = () => {
  const [folders, setFolders] = useState([]);
  const [forms, setForms] = useState([]);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [showNewFormModal, setShowNewFormModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFormName, setNewFormName] = useState('');
  const [darkMode, setDarkMode] = useState(true);
  const [workspaceId, setWorkspaceId] = useState(null);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [sharedEmail, setSharedEmail] = useState('');
  const [permissions, setPermissions] = useState('View');
  const [ownedWorkspaces, setOwnedWorkspaces] = useState([]);
  const [sharedWorkspaces, setSharedWorkspaces] = useState([]);
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userPermissions, setUserPermissions] = useState('Edit');
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [authChecked, setAuthChecked] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
const [deleteType, setDeleteType] = useState(''); // 'form' or 'folder'
const [itemToDelete, setItemToDelete] = useState(null);
  // New effect to check auth status
  useEffect(() => {
    const checkAuth = async () => {
      const userId = localStorage.getItem('UserId');
      if (userId) {
        setAuthChecked(true);
      }
    };
    checkAuth();
  }, []);

 

  // Modified initialization effect
 // Modify your initialization effect in the Workspace component
useEffect(() => {
  const initializeWorkspace = async () => {
    try {
      setIsLoading(true);
      const pathParts = location.pathname.split('/');
      const isShareLink = pathParts[2] === 'share' && pathParts[3];
      const userId = localStorage.getItem('UserId');
      const sharedWorkspaceId = isShareLink ? pathParts[3] : null;
      
 // Get permissions from URL if it's a share link
 const urlParams = new URLSearchParams(window.location.search);
 const linkPermissions = urlParams.get('permissions');

      // Important: Check if this is a share link and we're already processing it
      const isProcessingShare = localStorage.getItem('isProcessingShare');
      
      if (isShareLink && !userId && !isProcessingShare) {
        // Store permissions along with other share data
        localStorage.setItem('isProcessingShare', 'true');
        localStorage.setItem('pendingShare', sharedWorkspaceId);
        localStorage.setItem('pendingSharePermissions', linkPermissions || 'view'); // Default to view if not specified
        localStorage.setItem('originalShareUrl', window.location.href);
        window.location.href = '/auth';
        return;
      }

      // If we have userId and there's a pending share, process it
      if (userId && localStorage.getItem('pendingShare')) {
        const pendingShareId = localStorage.getItem('pendingShare');
        const pendingPermissions = localStorage.getItem('pendingSharePermissions') || 'view';
        const userid = localStorage.getItem('UserId');
        try {
          console.log("Calling addSharedWorkspace with ID:", pendingShareId);
          await addSharedWorkspace(pendingShareId, userid, pendingPermissions);
          
          // Clear all share-related data after processing
          localStorage.removeItem('pendingShare');
          localStorage.removeItem('pendingSharePermissions');
          localStorage.removeItem('originalShareUrl');
          localStorage.removeItem('isProcessingShare');
          
          // Refresh workspaces
          const storedUsername = localStorage.getItem('username');
          const updatedWorkspaces = await getUserWorkspaces(storedUsername);
          
          setOwnedWorkspaces(updatedWorkspaces.owned);
          setSharedWorkspaces(updatedWorkspaces.shared);
          
          // Set current workspace to the shared one
          const sharedWorkspace = updatedWorkspaces.shared.find(w => w._id === pendingShareId);
          if (sharedWorkspace) {
            setCurrentWorkspace(sharedWorkspace);
            setWorkspaceId(pendingShareId);
            localStorage.setItem('workspaceId', pendingShareId);
          }
          
          navigate('/workspace');
          return;
        } catch (error) {
          console.error('Error processing shared workspace:', error);
          setError('Error accessing shared workspace. Please check the link and try again.');
          // Clear share data on error
          localStorage.removeItem('pendingShare');
          localStorage.removeItem('pendingSharePermissions');
          localStorage.removeItem('originalShareUrl');
          localStorage.removeItem('isProcessingShare');
        }
      }

      // Normal workspace initialization
      const storedUsername = localStorage.getItem('username');
      if (storedUsername) {
        const { owned, shared } = await getUserWorkspaces(storedUsername);
        setOwnedWorkspaces(owned);
        setSharedWorkspaces(shared);

        // Handle workspace selection
        const storedWorkspaceId = localStorage.getItem('workspaceId');
        if (storedWorkspaceId) {
          const workspace = [...owned, ...shared].find(w => w._id === storedWorkspaceId);
          if (workspace) {
            setCurrentWorkspace(workspace);
            setWorkspaceId(storedWorkspaceId);
          } else if (owned.length > 0) {
            setCurrentWorkspace(owned[0]);
            setWorkspaceId(owned[0]._id);
            localStorage.setItem('workspaceId', owned[0]._id);
          }
        } else if (owned.length > 0) {
          setCurrentWorkspace(owned[0]);
          setWorkspaceId(owned[0]._id);
          localStorage.setItem('workspaceId', owned[0]._id);
        }
      }

      setIsInitialized(true);
    } catch (error) {
      console.error('Initialization error:', error);
      setError('Error initializing workspace');
    } finally {
      setIsLoading(false);
    }
  };

  initializeWorkspace();
}, [location.pathname, navigate]);

  useEffect(() => {
    document.body.style.backgroundColor = darkMode ? '#1a1a1a' : '#ffffff';
    document.body.style.color = darkMode ? '#ffffff' : '#000000';
  }, [darkMode]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const storedUsername = localStorage.getItem('username');
        const { owned, shared } = await getUserWorkspaces(storedUsername);
        setOwnedWorkspaces(owned);
        setSharedWorkspaces(shared);
        
        const storedWorkspaceId = localStorage.getItem('workspaceId');
        if (storedWorkspaceId) {
          const workspace = [...owned, ...shared].find(w => w._id === storedWorkspaceId);
          setCurrentWorkspace(workspace);
          setWorkspaceId(storedWorkspaceId);
        } else if (owned.length > 0) {
          setCurrentWorkspace(owned[0]);
          setWorkspaceId(owned[0]._id);
          localStorage.setItem('workspaceId', owned[0]._id);
        }
      } catch (error) {
        console.error('Error fetching workspaces:', error);
      }
    };

    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }

    fetchWorkspaces();
  }, []);

  useEffect(() => {
    if (workspaceId) {
      const fetchWorkspaceData = async () => {
        try {
          const data = await getWorkspace(workspaceId);
          const processedFolders = data.folders.map(folder => ({
            id: folder._id,
            name: folder.name,
            forms: folder.formbots?.map(formbot => ({
              id: formbot._id || formbot.id,
              name: formbot.name
            })).filter(form => form.id) || [] // Filter out forms with undefined IDs
          }));
          const processedForms = data.formbots
            .map(formbot => ({
              id: formbot._id || formbot.id,
              name: formbot.name
            }))
            .filter(form => form.id); // Filter out forms with undefined IDs
          setFolders(processedFolders);
          setForms(processedForms);
        } catch (error) {
          console.error('Error fetching workspace:', error);
        }
      };
      fetchWorkspaceData();
    }
  }, [workspaceId]);


  useEffect(() => {
    if (currentWorkspace) {
      const userId = localStorage.getItem('UserId');
      
      if (currentWorkspace.owner._id === userId) {
        setUserPermissions('Edit');
      } else {
        const userShare = currentWorkspace.sharedWith?.find(
          share => share.userId._id === userId
        );
        setUserPermissions(userShare?.permissions || 'View');
      }
    }
  }, [currentWorkspace]);



  
  const switchWorkspace = (workspace) => {
    setCurrentWorkspace(workspace);
    setWorkspaceId(workspace._id);
    localStorage.setItem('workspaceId', workspace._id);
    setIsDropdownOpen(false);
  };

  const handleSendInvite = async () => {
    try {
      await shareWorkspace(workspaceId, sharedEmail, permissions);
      setSharedEmail('');
      setPermissions('View');
      setShowShareModal(false);
    } catch (error) {
      console.error('Error sharing workspace:', error);
    }
  };

  const handleCreateFolder = async () => {
    if (newFolderName.trim() && workspaceId) {
      try {
        const newFolder = await addFolder(workspaceId, newFolderName);
        setFolders(prev => [...prev, { id: newFolder._id, name: newFolderName, forms: [] }]);
        setNewFolderName('');
        setShowNewFolderModal(false);
      } catch (error) {
        console.error('Error creating folder:', error);
      }
    }
  };

  const hasEditPermissions = () => {
    const userId = localStorage.getItem('UserId');
    
    // If user is the workspace owner, they have edit permissions
    if (currentWorkspace?.owner._id === userId) {
      return true;
    }
    
    // Check shared permissions
    const userShare = currentWorkspace?.sharedWith?.find(
      share => share.userId._id === userId
    );
    
    // Explicitly check for 'edit' permission (case insensitive)
    return userShare?.permissions?.toLowerCase() === 'edit';
  };


  
  const handleCreateForm = async () => {
    if (newFormName.trim() && workspaceId) {
      try {
        let newForm;
        if (selectedFolder) {
          newForm = await addFormbotToFolder(workspaceId, selectedFolder, newFormName);
        } else {
          newForm = await addFormbot(workspaceId, newFormName);
        }
        
        // Check for both _id and id since the API might return either
        const formId = newForm._id || newForm.id;
        
        if (!formId) {
          console.error('Server response:', newForm);
          throw new Error('Server returned form without ID');
        }
  
        if (selectedFolder) {
          setFolders(prev => prev.map(folder => 
            folder.id === selectedFolder
              ? { 
                  ...folder, 
                  forms: [...folder.forms, { 
                    id: formId,  // Use the extracted ID
                    name: newFormName 
                  }]
                }
              : folder
          ));
        } else {
          setForms(prev => [...prev, { 
            id: formId,  // Use the extracted ID
            name: newFormName 
          }]);
        }
        
        setNewFormName('');
        setShowNewFormModal(false);
      } catch (error) {
        console.error('Error creating form:', error);
        // Show user-friendly error message
        alert('Failed to create form. Please try again.');
      }
    }
  };

  const handleDelete = async () => {
    if (deleteType === 'form') {
      await deleteFormbot(workspaceId, itemToDelete);
      if (selectedFolder) {
        setFolders(prev => prev.map(folder =>
          folder.id === selectedFolder
            ? { ...folder, forms: folder.forms.filter(form => form.id !== itemToDelete) }
            : folder
        ));
      } else {
        setForms(prev => prev.filter(form => form.id !== itemToDelete));
      }
    } else if (deleteType === 'folder') {
      await deleteFolder(workspaceId, itemToDelete);
      setFolders(prev => prev.filter(f => f.id !== itemToDelete));
    }
    setShowDeleteModal(false);
    setItemToDelete(null);
  };


  if (isLoading) {
    return <div className={styles.loading}>Loading workspace...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }


  return (
    <div className={`${styles.container} ${darkMode ? styles.darkMode : styles.lightMode}`}>
      <header className={styles.header}>
        <div className={styles.headerLeft} ref={dropdownRef}>
          <button className={styles.workspaceButton} onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
            {currentWorkspace?.owner.username}'s workspace
            {isDropdownOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          {isDropdownOpen && (
            <div className={styles.dropdown}>
              {ownedWorkspaces.map(workspace => (
                <button
                  key={workspace._id}
                  onClick={() => switchWorkspace(workspace)}
                  className={styles.dropdownItem}
                >
                  {workspace.owner.username}'s workspace
                </button>
              ))}
              
              {sharedWorkspaces.length > 0 && (
                <>
                  <div className={styles.dropdownDivider}>Shared with me</div>
                  {sharedWorkspaces.map(workspace => (
                    <button
                      key={workspace._id}
                      onClick={() => switchWorkspace(workspace)}
                      className={styles.dropdownItem}
                    >
                      {workspace.owner.username}'s workspace
                      <span className={styles.permission}>
                        ({workspace.sharedWith.find(s => s.userId._id === localStorage.getItem('UserId'))?.permissions})
                      </span>
                    </button>
                  ))}
                </>
              )}
              
              <div className={styles.dropdownDivider} />
              <button 
  className={styles.dropdownItem} 
  onClick={() => navigate('/settings')}
>
  Settings
</button>
              <button className={`${styles.dropdownItem} ${styles.logoutButton}`} onClick={() => {
                localStorage.clear();
                window.location.href = '/auth';
              }}>
                Log Out
              </button>
            </div>
          )}
          
        </div>

        <div className={styles.headerRight}>
          <div className={styles.themeToggle}>
            <span>Light</span>
            <button onClick={() => setDarkMode(!darkMode)} className={`${styles.toggleButton} ${darkMode ? styles.toggleActive : ''}`}>
              <div className={`${styles.toggleKnob} ${darkMode ? styles.toggleKnobActive : ''}`} />
            </button>
            <span>Dark</span>
          </div>
          <button className={styles.shareButton} onClick={() => setShowShareModal(true)}>Share</button>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.folderSection}>
          {hasEditPermissions() && (
            <button 
              onClick={() => setShowNewFolderModal(true)} 
              className={styles.createFolderButton}
            >
              <img src={Folder} alt="Create Folder" className={styles.folderIcon} />
              <span>Create a Folder</span>
            </button>
          )}

          {folders.map(folder => (
            <div
              key={folder.id}
              className={`${styles.folder} ${selectedFolder === folder.id ? styles.selected : ''}`}
              onClick={() => setSelectedFolder(folder.id)}
            >
              <span className={styles.folderName}>{folder.name}</span>
              {hasEditPermissions() && (
                <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteType('folder');
                  setItemToDelete(folder.id);
                  setShowDeleteModal(true);
                }}
                  className={styles.deleteButton}
                >
                  <img src={Delete} alt="Delete Folder" className={styles.deleteIcon} />
                </button>
              )}
            </div>
          ))}
        </section>

        <FormbotGrid
  forms={selectedFolder ? folders.find(f => f.id === selectedFolder)?.forms || [] : forms}
  onDelete={async (formId) => {
    if (hasEditPermissions()) {
      setDeleteType('form');
      setItemToDelete(formId);
      setShowDeleteModal(true);
    }
  }}
  onCreate={() => setShowNewFormModal(true)}
  navigate={navigate}
  hasEditPermissions={hasEditPermissions()} // Pass the result here
/>
      </main>

      {showNewFolderModal && (
        <Modal
          title="Create New Folder"
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
          onClose={() => setShowNewFolderModal(false)}
          onSubmit={handleCreateFolder}
          placeholder="Enter folder name"
        />
      )}

      {showNewFormModal && (
        <Modal
          title={`Create New Formbot ${selectedFolder ? 'in Folder' : ''}`}
          value={newFormName}
          onChange={(e) => setNewFormName(e.target.value)}
          onClose={() => setShowNewFormModal(false)}
          onSubmit={handleCreateForm}
          placeholder="Enter formbot name"
        />
      )}

      {showShareModal && (
        <ShareModal
          onClose={() => setShowShareModal(false)}
          onShare={handleSendInvite}
          email={sharedEmail}
          setEmail={setSharedEmail}
          permissions={permissions}
          setPermissions={setPermissions}
        />
      )}
    
    {showDeleteModal && (
  <DeleteConfirmationModal
    type={deleteType}
    onClose={() => {
      setShowDeleteModal(false);
      setItemToDelete(null);
    }}
    onConfirm={handleDelete}
  />
)}
    </div>
  );
};

export default Workspace;