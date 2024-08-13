import mongoose from 'mongoose';
import { Category } from 'models';

type UpdateUniqueCategoryName = (props: {
  uniqueCategories: Array<string>;
  category: {
    name: string;
  };
}) => Promise<mongoose.Types.ObjectId>;

export const updateUniqueCategoryName: UpdateUniqueCategoryName = async (props) => {
  const { uniqueCategories, category } = props;

  let categoryId;
  const categoryExists = uniqueCategories.includes(category.name);

  if (categoryExists) {
    let foundCategory = await Category.findOne({ name: category.name });
    if (!foundCategory) throw 'could not find category';
    categoryId = foundCategory._id;
    return categoryId;
  }

  // create category
  uniqueCategories.push(category.name);
  let createdCategory = await Category.create({ name: category.name });
  createdCategory.save();
  categoryId = createdCategory._id;
  return categoryId;
};
