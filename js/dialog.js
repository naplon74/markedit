// Custom dialog system for better UI

class Dialog {
  constructor() {
    this.dialogContainer = null;
    this.createDialogContainer();
  }

  createDialogContainer() {
    if (!this.dialogContainer) {
      this.dialogContainer = document.createElement('div');
      this.dialogContainer.id = 'dialog-container';
      this.dialogContainer.innerHTML = `
        <style>
          #dialog-container {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.7);
            z-index: 10000;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.2s ease;
          }

          #dialog-container.show {
            display: flex;
          }

          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          .dialog-box {
            background-color: #252526;
            border-radius: 8px;
            padding: 0;
            max-width: 450px;
            width: 90%;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8);
            animation: slideUp 0.3s ease-out;
            border: 1px solid #3e3e42;
          }

          @keyframes slideUp {
            from {
              transform: translateY(20px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }

          .dialog-header {
            padding: 20px 24px;
            border-bottom: 1px solid #3e3e42;
          }

          .dialog-title {
            font-size: 18px;
            font-weight: 600;
            color: #ffffff;
            margin: 0;
          }

          .dialog-content {
            padding: 24px;
            color: #d4d4d4;
            font-size: 14px;
            line-height: 1.6;
          }

          .dialog-input {
            width: 100%;
            padding: 10px 12px;
            background-color: #1e1e1e;
            border: 1px solid #3e3e42;
            border-radius: 4px;
            color: #d4d4d4;
            font-size: 14px;
            font-family: inherit;
            margin-top: 12px;
            transition: border-color 0.2s;
          }

          .dialog-input:focus {
            outline: none;
            border-color: #5a5a5a;
          }

          .dialog-footer {
            padding: 16px 24px;
            border-top: 1px solid #3e3e42;
            display: flex;
            justify-content: flex-end;
            gap: 10px;
          }

          .dialog-btn {
            padding: 8px 20px;
            border-radius: 4px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
            border: 1px solid transparent;
          }

          .dialog-btn:hover {
            transform: translateY(-1px);
          }

          .dialog-btn:active {
            transform: translateY(0);
          }

          .dialog-btn-primary {
            background: linear-gradient(135deg, #3a3a3a 0%, #2a2a2a 100%);
            color: #ffffff;
            border-color: #4a4a4a;
          }

          .dialog-btn-primary:hover {
            background: linear-gradient(135deg, #4a4a4a 0%, #3a3a3a 100%);
            border-color: #5a5a5a;
          }

          .dialog-btn-secondary {
            background: transparent;
            color: #cccccc;
            border-color: #3e3e42;
          }

          .dialog-btn-secondary:hover {
            background-color: #2a2a2a;
            border-color: #4a4a4a;
          }

          .dialog-btn-danger {
            background: linear-gradient(135deg, #c72c41 0%, #a01d2f 100%);
            color: #ffffff;
            border-color: #d63447;
          }

          .dialog-btn-danger:hover {
            background: linear-gradient(135deg, #d63447 0%, #c72c41 100%);
            box-shadow: 0 4px 12px rgba(199, 44, 65, 0.3);
          }
        </style>
        <div class="dialog-box" id="dialog-box"></div>
      `;
      document.body.appendChild(this.dialogContainer);
    }
  }

  show(options) {
    return new Promise((resolve) => {
      const dialogBox = this.dialogContainer.querySelector('#dialog-box');
      
      let footerHTML = '';
      if (options.buttons) {
        footerHTML = '<div class="dialog-footer">';
        options.buttons.forEach((btn) => {
          footerHTML += `<button class="dialog-btn ${btn.className || 'dialog-btn-secondary'}" data-value="${btn.value}">${btn.text}</button>`;
        });
        footerHTML += '</div>';
      }

      let inputHTML = '';
      if (options.input) {
        inputHTML = `<input type="text" class="dialog-input" id="dialog-input" placeholder="${options.input.placeholder || ''}" value="${options.input.value || ''}">`;
      }

      dialogBox.innerHTML = `
        <div class="dialog-header">
          <h3 class="dialog-title">${options.title || 'Dialog'}</h3>
        </div>
        <div class="dialog-content">
          ${options.message || ''}
          ${inputHTML}
        </div>
        ${footerHTML}
      `;

      this.dialogContainer.classList.add('show');

      // Focus input if present
      if (options.input) {
        setTimeout(() => {
          const input = dialogBox.querySelector('#dialog-input');
          if (input) {
            input.focus();
            if (options.input.select) {
              input.select();
            }
          }
        }, 100);
      }

      // Handle button clicks
      const buttons = dialogBox.querySelectorAll('.dialog-btn');
      buttons.forEach((btn) => {
        btn.addEventListener('click', () => {
          const value = btn.getAttribute('data-value');
          let result = { action: value };
          
          if (options.input) {
            const input = dialogBox.querySelector('#dialog-input');
            result.inputValue = input ? input.value : '';
          }
          
          this.hide();
          resolve(result);
        });
      });

      // Handle Enter key
      if (options.input) {
        const input = dialogBox.querySelector('#dialog-input');
        if (input) {
          input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
              const primaryBtn = dialogBox.querySelector('.dialog-btn-primary');
              if (primaryBtn) primaryBtn.click();
            }
          });
        }
      }

      // Handle Escape key
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          this.hide();
          resolve({ action: 'cancel' });
          document.removeEventListener('keydown', handleEscape);
        }
      };
      document.addEventListener('keydown', handleEscape);

      // Handle backdrop click
      this.dialogContainer.addEventListener('click', (e) => {
        if (e.target === this.dialogContainer) {
          this.hide();
          resolve({ action: 'cancel' });
        }
      }, { once: true });
    });
  }

  hide() {
    this.dialogContainer.classList.remove('show');
  }

  // Convenience methods
  confirm(title, message) {
    return this.show({
      title,
      message,
      buttons: [
        { text: 'Cancel', value: 'cancel', className: 'dialog-btn-secondary' },
        { text: 'OK', value: 'ok', className: 'dialog-btn-primary' }
      ]
    });
  }

  confirmSave(message) {
    return this.show({
      title: 'Unsaved Changes',
      message,
      buttons: [
        { text: "Don't Save", value: 'dont-save', className: 'dialog-btn-secondary' },
        { text: 'Cancel', value: 'cancel', className: 'dialog-btn-secondary' },
        { text: 'Save', value: 'save', className: 'dialog-btn-primary' }
      ]
    });
  }

  alert(title, message) {
    return this.show({
      title,
      message,
      buttons: [
        { text: 'OK', value: 'ok', className: 'dialog-btn-primary' }
      ]
    });
  }

  prompt(title, message, defaultValue = '', placeholder = '') {
    return this.show({
      title,
      message,
      input: {
        value: defaultValue,
        placeholder,
        select: true
      },
      buttons: [
        { text: 'Cancel', value: 'cancel', className: 'dialog-btn-secondary' },
        { text: 'OK', value: 'ok', className: 'dialog-btn-primary' }
      ]
    });
  }

  confirmDelete(itemName) {
    return this.show({
      title: 'Confirm Delete',
      message: `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
      buttons: [
        { text: 'Cancel', value: 'cancel', className: 'dialog-btn-secondary' },
        { text: 'Delete', value: 'delete', className: 'dialog-btn-danger' }
      ]
    });
  }
}

// Create global instance
if (typeof window !== 'undefined') {
  window.dialog = new Dialog();
}

module.exports = Dialog;
