import mongoose, { Schema } from 'mongoose';
import { ROLES, EMAIL_PROVIDER } from '../utils/constants';
import { UserInterface } from '../utils/types';

const UserSchema: Schema<UserInterface> = new Schema<UserInterface>({
  email: {
    type: String,
    required: function (this: UserInterface) {
      return this.provider === EMAIL_PROVIDER.Email;
    }
  },
  phoneNumber: {
    type: String
  },
  firstName: {
    type: String
  },
  lastName: {
    type: String
  },
  password: {
    type: String
  },
  merchant: {
    type: Schema.Types.ObjectId,
    ref: 'Merchant',
    default: null
  },
  provider: {
    type: String,
    required: true,
    default: EMAIL_PROVIDER.Email
  },
  googleId: {
    type: String
  },
  role: {
    type: String,
    default: ROLES.Member,
    enum: [ROLES.Admin, ROLES.Member, ROLES.Merchant]
  },
  favorites: [{
    type: Schema.Types.ObjectId,
    ref: 'Product'
  }],
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpires: {
    type: Date
  },
},
{
  timestamps:true // Mongoose automatically adds createdAt and updatedAt
}
);

UserSchema.index({ email: 1 });
UserSchema.index({ phoneNumber: 1 });
UserSchema.index({ googleId: 1 });

const UserModel = mongoose.model<UserInterface>('User', UserSchema);
export default UserModel;