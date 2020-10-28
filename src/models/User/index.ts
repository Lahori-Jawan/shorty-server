import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { tryy, createToken } from '../../utils';
import IResponse from '../../interfaces/response';
import { ErrorHandler } from '../../utils';

const { Schema } = mongoose;
const saltRounds = 10;

type comparePasswordFunc = (candidatePassword: string) => Promise<boolean>;

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required to save activities'],
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    default: {
      type: String,
      default: 'pbid.io',
    },
    purchased: [
      {
        domain: {
          type: String,
          required: [true, 'INTERNAL: domain name is required'],
          alias: 'name',
        },
        active: false,
      },
    ],
    accessToken: { type: String },
  },
  { timestamps: true }
);

UserSchema.pre('save', async function save(next) {
  const user = this;

  if (!user.isModified('password')) {
    return next();
  }

  const promise = bcrypt.hash(user.password, saltRounds);
  const [err, hashedData] = await tryy(promise);

  if (err) next(err);

  const { token } = createToken({ userId: user._id });

  user.accessToken = token;
  user.password = hashedData;

  next();
});

const comparePassword: comparePasswordFunc = async function (
  candidatePassword: string
) {
  return bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.comparePassword = comparePassword;

UserSchema.statics.findOrCreate2 = async function (user) {
  const record = await this.findOne({
    $or: [{ username: user.username }, { email: user.email }],
  }).lean();

  if (record)
    return {
      created: false,
      record,
      message: 'User exists already!',
      status: 400,
    };

  return new Promise(async (resolve) => {
    const [error, doc] = await tryy(this.create(user));

    let response: IResponse = {
      message: 'User created successfully',
      created: Boolean(doc),
      status: 201,
      record: doc,
    };

    if (!doc) {
      const message = error.message.includes('INTERNAL')
        ? 'Something went wrong'
        : error.message;
      response.status = 500;
      response.message = message;
      console.log({ userError: error.message });
    }

    resolve(response);
  });
};

UserSchema.statics.findOrCreate = async function (user) {
  const record = await this.findOne({ username: user.username }).lean();

  if (record)
    return {
      created: false,
      record,
      message: 'Logged in successfully',
      status: 200,
    };

  return new Promise(async (resolve) => {
    // if(user.purchased) {
    //   user.purchased = [{domain: user.purchased}]
    // }
    const [error, doc] = await tryy(this.create(user));

    let response: IResponse = {
      message: 'User created successfully',
      created: Boolean(doc),
      status: 201,
      record: doc,
    };

    if (!doc) {
      const message = error.message.includes('INTERNAL')
        ? 'Something went wrong'
        : error.message;
      response.status = 500;
      response.message = message;
      console.log({ userError: error.message });
    }

    resolve(response);
  });
};

UserSchema.statics.getUser = async function (_id) {
  return await tryy(
    this.findById(_id).orFail(new ErrorHandler('User not found', 404))
  );
};

UserSchema.methods.purchase = async function (domains: string[]) {
  const HAS_ACTIVE_DOMAIN = this.purchased.some((domain) => domain?.active);
  domains.forEach((domain, index) => {
    this.purchased.push({
      domain,
      active: !HAS_ACTIVE_DOMAIN && index == 0 ? true : false,
    });
  });

  const [error, doc] = await tryy(this.save());

  let response: IResponse = {
    message: 'Domain purchased successfully',
    created: Boolean(doc),
    status: 200,
    record: doc,
  };

  if (!doc) {
    const message = error.message.includes('INTERNAL')
      ? 'Something went wrong'
      : error.message;
    response.status = 500;
    response.message = message;
  }

  return response;
};

UserSchema.methods.setActiveDomain = async function (domainId: string) {
  let domain = { active: false };
  let response: IResponse = {
    message: ``,
    created: true,
    status: 200,
    record: null,
  };

  this.purchased.forEach((customDomain: any) => {
    if (customDomain.id === domainId) {
      customDomain.active = true;
      domain = customDomain;
    } else {
      customDomain.active = false;
    }
  });

  if (!domain.active) {
    response.message = `Couldn't activate domain`;
    response.status = 400;
    response.created = false;
    return response;
  }

  const [error, doc] = await tryy(this.save());

  if (!doc) {
    const message = error.message.includes('INTERNAL')
      ? 'Something went wrong'
      : error.message;
    response.status = 500;
    response.message = message;
    console.log({ activeDomainError: error.message });
  }

  response.record = doc;

  return response;
};

UserSchema.virtual('activeDomain').get(function () {
  return (
    this.purchased.find((domain: any) => domain?.active)?.name || this.default
  );
});

export default mongoose.model('User', UserSchema);
