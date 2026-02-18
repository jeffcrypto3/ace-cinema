/**
 * Custom Modal System for Ace Cinema
 * Replaces browser alert() with styled modals
 */

// Create modal HTML structure
function createModalHTML() {
    if (document.getElementById('aceModal')) return; // Already exists
    
    const modalHTML = `
        <div id="aceModal" class="ace-modal-overlay">
            <div class="ace-modal">
                <button class="ace-modal-close" id="aceModalClose">
                    <i class="fa-solid fa-xmark"></i>
                </button>
                <div class="ace-modal-icon" id="aceModalIcon">
                    <i class="fa-solid fa-circle-info"></i>
                </div>
                <h3 class="ace-modal-title" id="aceModalTitle">Notice</h3>
                <p class="ace-modal-message" id="aceModalMessage"></p>
                <button class="ace-modal-btn" id="aceModalBtn">OK</button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Add event listeners
    const overlay = document.getElementById('aceModal');
    const closeBtn = document.getElementById('aceModalClose');
    const okBtn = document.getElementById('aceModalBtn');
    
    closeBtn.addEventListener('click', closeModal);
    okBtn.addEventListener('click', closeModal);
    
    // Close on overlay click (outside modal)
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal();
    });
    
    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('active')) {
            closeModal();
        }
    });
}

// Close modal
function closeModal() {
    const modal = document.getElementById('aceModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

/**
 * Show modal with custom message
 * @param {string} message - The message to display
 * @param {Object} options - Optional settings
 * @param {string} options.type - 'info', 'warning', 'error', 'success' (default: 'info')
 * @param {string} options.title - Custom title (optional)
 * @param {string} options.buttonText - Custom button text (default: 'OK')
 * @param {Function} options.onClose - Callback when modal closes
 */
function showModal(message, options = {}) {
    createModalHTML();
    
    const {
        type = 'info',
        title = null,
        buttonText = 'OK',
        onClose = null
    } = options;
    
    const modal = document.getElementById('aceModal');
    const iconEl = document.getElementById('aceModalIcon');
    const titleEl = document.getElementById('aceModalTitle');
    const messageEl = document.getElementById('aceModalMessage');
    const btnEl = document.getElementById('aceModalBtn');
    
    // Set icon and color based on type
    const typeConfig = {
        info: {
            icon: 'fa-circle-info',
            title: 'Notice',
            color: '#ffcc00'
        },
        warning: {
            icon: 'fa-triangle-exclamation',
            title: 'Warning',
            color: '#ff9800'
        },
        error: {
            icon: 'fa-circle-exclamation',
            title: 'Error',
            color: '#dc3545'
        },
        success: {
            icon: 'fa-circle-check',
            title: 'Success',
            color: '#28a745'
        }
    };
    
    const config = typeConfig[type] || typeConfig.info;
    
    iconEl.innerHTML = `<i class="fa-solid ${config.icon}"></i>`;
    iconEl.style.color = config.color;
    titleEl.textContent = title || config.title;
    messageEl.textContent = message;
    btnEl.textContent = buttonText;
    
    // Set modal type class for potential styling
    modal.className = 'ace-modal-overlay active';
    modal.dataset.type = type;
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Handle onClose callback
    if (onClose) {
        const closeHandler = () => {
            onClose();
            btnEl.removeEventListener('click', closeHandler);
            document.getElementById('aceModalClose').removeEventListener('click', closeHandler);
        };
        btnEl.addEventListener('click', closeHandler);
        document.getElementById('aceModalClose').addEventListener('click', closeHandler);
    }
    
    // Focus the OK button for accessibility
    setTimeout(() => btnEl.focus(), 100);
}

// Initialize modal HTML on page load
document.addEventListener('DOMContentLoaded', createModalHTML);
