/**
 * Defines what the input for a Error should be.
 */
interface ErrorInput {
    code: string;
    message: string;
    category: string;
    reference: string;
    status: string;
    traceId: string;
}

/**
 * Defines a error from the Tikkie API.
 */
export class TikkieError extends Error {
    name: string;
    message: string;
    data: ErrorInput;

    /**
     * Initialize a new instance of TikkieError.
     * 
     * @param error The input object where we can create the TikkieError object of.
     */
    constructor(error: ErrorInput) {
        super();
        this.name = 'TikkieError';
        this.message = `${error.code} - ${error.category}: ${error.message}`;
        this.data = error;
    }
}

/**
 * Defines a collection of TikkieErrors.
 */
export class TikkieErrorCollection extends Error {
    name: string;
    message: string;
    errors: TikkieError[];

    /**
     * Initializes a new instance of TikkieErrorCollection.
     * 
     * @param errors The collection of input object where we can create the TikkieError objects of.
     */
    constructor(errors: ErrorInput[]) {
        super();
        this.name = 'TikkieErrorCollection';
        this.errors = errors.map((error) => new TikkieError(error));
        this.message = `[${this.errors.map((error: TikkieError) => error.message).join(', ')}]`;
    }
}
