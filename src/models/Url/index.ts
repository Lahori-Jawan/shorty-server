import mongoose from 'mongoose';
import shortId from 'shortid';
import { tryy } from '../../utils';
import { ErrorHandler } from '../../utils';
import { IResponse, IURL } from '../../interfaces';

const { Schema } = mongoose;

const URLSchema = new Schema(
  {
    url: {
      type: String,
      required: [true, 'URL is required'],
    },
    short: {
      type: String,
      required: [true, 'INTERNAL: short URL is required'],
      unique: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

URLSchema.statics.findOrCreate = async function (urlObj: IURL) {
  urlObj.url = urlObj.url.toLowerCase().trim();

  const record = await this.findOne({
    url: urlObj.url,
    user: urlObj.userId,
  }).lean();

  if (record)
    return {
      created: false,
      record,
      message: 'This record exists already',
      status: 400,
    };

  return new Promise(async (resolve) => {
    urlObj.short = `https://${urlObj.domain}/${shortId.generate()}`;

    const doc = this(urlObj);

    doc.$short = urlObj.short; // to access in hook i.e. .pre('save')

    const [error, urlDoc] = await tryy(doc.save());

    let response: IResponse = {
      message: 'URL shortened successfully',
      created: Boolean(urlDoc),
      status: 201,
      record: urlDoc,
    };

    if (error || !urlDoc) {
      const message = error.message.includes('INTERNAL')
        ? 'Something went wrong'
        : error.message;
      response.status = 500;
      response.message = message;
      console.log({ urlError: error.message });
    }

    resolve(response);
  });
};

URLSchema.pre('save', async function (next) {
  let found = await this.model('URL').findOne({ short: this.$short }).lean();

  if (found) {
    this.invalidate('short', 'INTERNAL: short must be unique');
    next(new ErrorHandler('INTERNAL: short must be unique', 500));
  }

  next();
});

export default mongoose.model<IURL>('URL', URLSchema);
