import { Category } from 'models';

type GetUniqueCategoryNames = () => Promise<Array<string>>;

export const getUniqueCategoryNames: GetUniqueCategoryNames = async () =>
  await Category.find()
    .select('-_id name')
    .then((categories) => categories.map((c) => c.name));
