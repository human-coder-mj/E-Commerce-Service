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


//as const ->freezes the object and makes each property a literal type, not just a general string.