import Swal from 'sweetalert2';

// Create custom Toast configuration with a modern look
export const toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  background: '#ffffff',
  color: '#333333',
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  }
});

// Create custom Alert configuration
export const alert = Swal.mixin({
  background: '#ffffff',
  color: '#333333',
  customClass: {
    confirmButton: 'btn btn-primary',
    cancelButton: 'btn btn-danger',
  },
  buttonsStyling: false
});

/**
 * Show a success notification
 * @param {string} message
 * @param {boolean} useToast
 */
export const showSuccess = (message, useToast = true) => {
  if (useToast) {
    toast.fire({
      icon: 'success',
      title: message,
      iconColor: '#28a745'
    });
  } else {
    alert.fire({
      icon: 'success',
      title: 'Success',
      text: message,
      confirmButtonText: 'OK'
    });
  }
};

/**
 * Show an error notification
 * @param {string} message
 * @param {boolean} useToast
 */
export const showError = (message, useToast = true) => {
  if (useToast) {
    toast.fire({
      icon: 'error',
      title: message,
      iconColor: '#dc3545'
    });
  } else {
    alert.fire({
      icon: 'error',
      title: 'Error',
      text: message,
      confirmButtonText: 'OK'
    });
  }
};
