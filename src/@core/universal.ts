import { nanoid } from 'nanoid';

export const generateId = (options) => {
  return options.suffix ? `${options.suffix}-${nanoid(options.length)}` : nanoid(options.length);
};
