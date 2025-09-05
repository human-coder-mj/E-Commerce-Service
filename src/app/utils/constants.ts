export const ROLES = {
    Admin: 'ROLE ADMIN',
    Member: 'ROLE MEMBER',
    Merchant: 'ROLE MERCHANT'
} as const;

export const EMAIL_PROVIDER = {
    Email: 'Email',
    Google: 'Google',
    Facebook: 'Facebook'
} as const;

export const GENDER = {
    Male: 'Male',
    Female: 'Female',
    Unisex: 'Unisex'
} as const;

export const PRODUCT_STATUS = {
    Active: true,
    Inactive: false
} as const;

export const ORDER_STATUS = {
    Pending: 'PENDING',
    Processing: 'PROCESSING',
    Shipped: 'SHIPPED',
    Delivered: 'DELIVERED',
    Cancelled: 'CANCELLED',
    Returned: 'RETURNED'
} as const;

export const REPORT_TYPE = {
    OrderIssue: 'ORDER_ISSUE',
    ProductDefect: 'PRODUCT_DEFECT',
    DeliveryProblem: 'DELIVERY_PROBLEM',
    PaymentIssue: 'PAYMENT_ISSUE',
    CustomerService: 'CUSTOMER_SERVICE',
    Other: 'OTHER'
} as const;

export const REPORT_STATUS = {
    Open: 'OPEN',
    InProgress: 'IN_PROGRESS',
    Resolved: 'RESOLVED',
    Closed: 'CLOSED'
} as const;

export const REPORT_PRIORITY = {
    Low: 'LOW',
    Medium: 'MEDIUM',
    High: 'HIGH',
    Critical: 'CRITICAL'
} as const;


//as const ->freezes the object and makes each property a literal type, not just a general string.