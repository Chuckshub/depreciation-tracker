import { 
  Accrual, 
  AccrualValidationError, 
  AccrualValidationResult,
  CreateAccrualRequest,
  UpdateAccrualRequest
} from '../types/accrual';

/**
 * Comprehensive validation utilities for accrual data
 */
export class AccrualValidator {
  private static readonly ACCOUNT_CODE_PATTERN = /^\d{4,6}$/;
  private static readonly MAX_VENDOR_LENGTH = 100;
  private static readonly MAX_DESCRIPTION_LENGTH = 255;
  private static readonly MAX_NOTES_LENGTH = 1000;

  /**
   * Validate account code format
   */
  private static validateAccountCode(code: string): boolean {
    return this.ACCOUNT_CODE_PATTERN.test(code.trim());
  }

  /**
   * Validate a complete accrual object
   */
  public static validateAccrual(accrual: Accrual): AccrualValidationResult {
    const errors: AccrualValidationError[] = [];

    // ID validation
    if (!accrual.id || accrual.id.trim().length === 0) {
      errors.push({
        field: 'id',
        message: 'ID is required',
        code: 'REQUIRED_FIELD'
      });
    }

    // Vendor validation
    if (!accrual.vendor || accrual.vendor.trim().length === 0) {
      errors.push({
        field: 'vendor',
        message: 'Vendor name is required',
        code: 'REQUIRED_FIELD'
      });
    } else if (accrual.vendor.length > this.MAX_VENDOR_LENGTH) {
      errors.push({
        field: 'vendor',
        message: `Vendor name must be less than ${this.MAX_VENDOR_LENGTH} characters`,
        code: 'MAX_LENGTH_EXCEEDED'
      });
    }

    // Description validation
    if (accrual.description && accrual.description.length > this.MAX_DESCRIPTION_LENGTH) {
      errors.push({
        field: 'description',
        message: `Description must be less than ${this.MAX_DESCRIPTION_LENGTH} characters`,
        code: 'MAX_LENGTH_EXCEEDED'
      });
    }

    // Account code validation
    if (accrual.accrualJEAccountDR) {
      if (!this.validateAccountCode(accrual.accrualJEAccountDR)) {
        errors.push({
          field: 'accrualJEAccountDR',
          message: 'Invalid debit account code format (should be 4-6 digits)',
          code: 'INVALID_FORMAT'
        });
      }
    }

    if (accrual.accrualJEAccountCR) {
      if (!this.validateAccountCode(accrual.accrualJEAccountCR)) {
        errors.push({
          field: 'accrualJEAccountCR',
          message: 'Invalid credit account code format (should be 4-6 digits)',
          code: 'INVALID_FORMAT'
        });
      }
    }

    // Balance validation
    if (typeof accrual.balance !== 'number' || isNaN(accrual.balance)) {
      errors.push({
        field: 'balance',
        message: 'Balance must be a valid number',
        code: 'INVALID_TYPE'
      });
    }

    // Notes validation
    if (accrual.notes && accrual.notes.length > this.MAX_NOTES_LENGTH) {
      errors.push({
        field: 'notes',
        message: `Notes must be less than ${this.MAX_NOTES_LENGTH} characters`,
        code: 'MAX_LENGTH_EXCEEDED'
      });
    }

    // Monthly entries validation
    if (accrual.monthlyEntries) {
      Object.entries(accrual.monthlyEntries).forEach(([monthKey, entry]) => {
        if (typeof entry.reversal !== 'number' || isNaN(entry.reversal)) {
          errors.push({
            field: `monthlyEntries.${monthKey}.reversal`,
            message: 'Reversal amount must be a valid number',
            code: 'INVALID_TYPE'
          });
        }

        if (typeof entry.accrual !== 'number' || isNaN(entry.accrual)) {
          errors.push({
            field: `monthlyEntries.${monthKey}.accrual`,
            message: 'Accrual amount must be a valid number',
            code: 'INVALID_TYPE'
          });
        }

        if (entry.notes && entry.notes.length > 500) {
          errors.push({
            field: `monthlyEntries.${monthKey}.notes`,
            message: 'Entry notes must be less than 500 characters',
            code: 'MAX_LENGTH_EXCEEDED'
          });
        }
      });
    }

    // Date validation
    if (accrual.createdAt && !(accrual.createdAt instanceof Date)) {
      errors.push({
        field: 'createdAt',
        message: 'Created date must be a valid Date object',
        code: 'INVALID_TYPE'
      });
    }

    if (accrual.updatedAt && !(accrual.updatedAt instanceof Date)) {
      errors.push({
        field: 'updatedAt',
        message: 'Updated date must be a valid Date object',
        code: 'INVALID_TYPE'
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate create accrual request
   */
  public static validateCreateRequest(request: CreateAccrualRequest): AccrualValidationResult {
    const errors: AccrualValidationError[] = [];

    // Vendor validation
    if (!request.vendor || request.vendor.trim().length === 0) {
      errors.push({
        field: 'vendor',
        message: 'Vendor name is required',
        code: 'REQUIRED_FIELD'
      });
    } else if (request.vendor.length > this.MAX_VENDOR_LENGTH) {
      errors.push({
        field: 'vendor',
        message: `Vendor name must be less than ${this.MAX_VENDOR_LENGTH} characters`,
        code: 'MAX_LENGTH_EXCEEDED'
      });
    }

    // Description validation
    if (!request.description || request.description.trim().length === 0) {
      errors.push({
        field: 'description',
        message: 'Description is required',
        code: 'REQUIRED_FIELD'
      });
    } else if (request.description.length > this.MAX_DESCRIPTION_LENGTH) {
      errors.push({
        field: 'description',
        message: `Description must be less than ${this.MAX_DESCRIPTION_LENGTH} characters`,
        code: 'MAX_LENGTH_EXCEEDED'
      });
    }

    // Account codes validation
    if (!request.accrualJEAccountDR || request.accrualJEAccountDR.trim().length === 0) {
      errors.push({
        field: 'accrualJEAccountDR',
        message: 'Debit account code is required',
        code: 'REQUIRED_FIELD'
      });
    } else if (!this.validateAccountCode(request.accrualJEAccountDR)) {
      errors.push({
        field: 'accrualJEAccountDR',
        message: 'Invalid debit account code format (should be 4-6 digits)',
        code: 'INVALID_FORMAT'
      });
    }

    if (!request.accrualJEAccountCR || request.accrualJEAccountCR.trim().length === 0) {
      errors.push({
        field: 'accrualJEAccountCR',
        message: 'Credit account code is required',
        code: 'REQUIRED_FIELD'
      });
    } else if (!this.validateAccountCode(request.accrualJEAccountCR)) {
      errors.push({
        field: 'accrualJEAccountCR',
        message: 'Invalid credit account code format (should be 4-6 digits)',
        code: 'INVALID_FORMAT'
      });
    }

    // Balance validation (optional)
    if (request.balance !== undefined) {
      if (typeof request.balance !== 'number' || isNaN(request.balance)) {
        errors.push({
          field: 'balance',
          message: 'Balance must be a valid number',
          code: 'INVALID_TYPE'
        });
      }
    }

    // Notes validation (optional)
    if (request.notes && request.notes.length > this.MAX_NOTES_LENGTH) {
      errors.push({
        field: 'notes',
        message: `Notes must be less than ${this.MAX_NOTES_LENGTH} characters`,
        code: 'MAX_LENGTH_EXCEEDED'
      });
    }

    // Monthly entries validation (optional)
    if (request.monthlyEntries) {
      Object.entries(request.monthlyEntries).forEach(([monthKey, entry]) => {
        if (typeof entry.reversal !== 'number' || isNaN(entry.reversal)) {
          errors.push({
            field: `monthlyEntries.${monthKey}.reversal`,
            message: 'Reversal amount must be a valid number',
            code: 'INVALID_TYPE'
          });
        }

        if (typeof entry.accrual !== 'number' || isNaN(entry.accrual)) {
          errors.push({
            field: `monthlyEntries.${monthKey}.accrual`,
            message: 'Accrual amount must be a valid number',
            code: 'INVALID_TYPE'
          });
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate update accrual request
   */
  public static validateUpdateRequest(request: UpdateAccrualRequest): AccrualValidationResult {
    const errors: AccrualValidationError[] = [];

    // ID validation
    if (!request.id || request.id.trim().length === 0) {
      errors.push({
        field: 'id',
        message: 'ID is required for updates',
        code: 'REQUIRED_FIELD'
      });
    }

    // Vendor validation (optional for updates)
    if (request.vendor !== undefined) {
      if (request.vendor.trim().length === 0) {
        errors.push({
          field: 'vendor',
          message: 'Vendor name cannot be empty',
          code: 'INVALID_VALUE'
        });
      } else if (request.vendor.length > this.MAX_VENDOR_LENGTH) {
        errors.push({
          field: 'vendor',
          message: `Vendor name must be less than ${this.MAX_VENDOR_LENGTH} characters`,
          code: 'MAX_LENGTH_EXCEEDED'
        });
      }
    }

    // Description validation (optional for updates)
    if (request.description !== undefined) {
      if (request.description.length > this.MAX_DESCRIPTION_LENGTH) {
        errors.push({
          field: 'description',
          message: `Description must be less than ${this.MAX_DESCRIPTION_LENGTH} characters`,
          code: 'MAX_LENGTH_EXCEEDED'
        });
      }
    }

    // Account codes validation (optional for updates)
    if (request.accrualJEAccountDR !== undefined) {
      if (request.accrualJEAccountDR.trim().length === 0) {
        errors.push({
          field: 'accrualJEAccountDR',
          message: 'Debit account code cannot be empty',
          code: 'INVALID_VALUE'
        });
      } else if (!this.validateAccountCode(request.accrualJEAccountDR)) {
        errors.push({
          field: 'accrualJEAccountDR',
          message: 'Invalid debit account code format (should be 4-6 digits)',
          code: 'INVALID_FORMAT'
        });
      }
    }

    if (request.accrualJEAccountCR !== undefined) {
      if (request.accrualJEAccountCR.trim().length === 0) {
        errors.push({
          field: 'accrualJEAccountCR',
          message: 'Credit account code cannot be empty',
          code: 'INVALID_VALUE'
        });
      } else if (!this.validateAccountCode(request.accrualJEAccountCR)) {
        errors.push({
          field: 'accrualJEAccountCR',
          message: 'Invalid credit account code format (should be 4-6 digits)',
          code: 'INVALID_FORMAT'
        });
      }
    }

    // Balance validation (optional for updates)
    if (request.balance !== undefined) {
      if (typeof request.balance !== 'number' || isNaN(request.balance)) {
        errors.push({
          field: 'balance',
          message: 'Balance must be a valid number',
          code: 'INVALID_TYPE'
        });
      }
    }

    // Notes validation (optional for updates)
    if (request.notes !== undefined && request.notes.length > this.MAX_NOTES_LENGTH) {
      errors.push({
        field: 'notes',
        message: `Notes must be less than ${this.MAX_NOTES_LENGTH} characters`,
        code: 'MAX_LENGTH_EXCEEDED'
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Sanitize and normalize accrual data
   */
  public static sanitizeAccrual(accrual: Partial<Accrual>): Partial<Accrual> {
    const sanitized: Partial<Accrual> = {};

    if (accrual.id) {
      sanitized.id = accrual.id.trim();
    }

    if (accrual.vendor) {
      sanitized.vendor = accrual.vendor.trim();
    }

    if (accrual.description) {
      sanitized.description = accrual.description.trim();
    }

    if (accrual.accrualJEAccountDR) {
      sanitized.accrualJEAccountDR = accrual.accrualJEAccountDR.trim();
    }

    if (accrual.accrualJEAccountCR) {
      sanitized.accrualJEAccountCR = accrual.accrualJEAccountCR.trim();
    }

    if (accrual.balance !== undefined) {
      sanitized.balance = Number(accrual.balance);
    }

    if (accrual.notes) {
      sanitized.notes = accrual.notes.trim();
    }

    if (accrual.monthlyEntries) {
      sanitized.monthlyEntries = {};
      Object.entries(accrual.monthlyEntries).forEach(([key, entry]) => {
        sanitized.monthlyEntries![key] = {
          reversal: Number(entry.reversal) || 0,
          accrual: Number(entry.accrual) || 0,
          notes: entry.notes?.trim()
        };
      });
    }

    if (accrual.isActive !== undefined) {
      sanitized.isActive = Boolean(accrual.isActive);
    }

    if (accrual.createdAt) {
      sanitized.createdAt = new Date(accrual.createdAt);
    }

    if (accrual.updatedAt) {
      sanitized.updatedAt = new Date(accrual.updatedAt);
    }

    return sanitized;
  }

  /**
   * Check if two accruals are substantially different
   */
  public static hasSignificantChanges(original: Accrual, updated: Partial<Accrual>): boolean {
    const significantFields = ['vendor', 'description', 'accrualJEAccountDR', 'accrualJEAccountCR', 'balance', 'monthlyEntries'];
    
    return significantFields.some(field => {
      if (field === 'monthlyEntries') {
        if (!updated.monthlyEntries) return false;
        
        // Check if monthly entries have changed
        const originalEntries = JSON.stringify(original.monthlyEntries);
        const updatedEntries = JSON.stringify(updated.monthlyEntries);
        return originalEntries !== updatedEntries;
      }
      
      return updated[field as keyof Accrual] !== undefined && 
             updated[field as keyof Accrual] !== original[field as keyof Accrual];
    });
  }
}