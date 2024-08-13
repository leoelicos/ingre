import dotenv from 'dotenv';
import { EdamamCredentials } from 'schemas/types';

dotenv.config({ path: '../.env' });

const APP_KEY = process.env.HEROKU_EDAMAM_APP_KEY || process.env.PRODUCTION_EDAMAM_APP_KEY;
const APP_ID = process.env.HEROKU_EDAMAM_APP_ID || process.env.PRODUCTION_EDAMAM_APP_ID;

export const getApiKey = async (): Promise<EdamamCredentials> => {
  try {
    if (APP_ID && APP_KEY) {
      return { appId: APP_ID, appKey: APP_KEY };
    } else {
      throw new Error('credentials not found');
    }
  } catch (error) {
    throw error;
  }
};
