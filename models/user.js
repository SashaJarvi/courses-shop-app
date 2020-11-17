/* создаем модель пользователя */
const {Schema, model} = require('mongoose');

const userSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  avatarUrl: String,
  resetToken: String,
  resetTokenExp: Date,
  name: String,
  cart: {
    items: [
      {
        amount: {
          type: Number,
          required: true,
          default: 1
        },
        courseId: {
          type: Schema.Types.ObjectId,
          ref: 'Course', /* связываем с моделью Course */
          required: true
        }
      }
    ]
  }
});

/* определяем кастомный метод добавления в корзину. Здесь важно определить функцию через function, поскольку мы будем
работать с this */
userSchema.methods.addToCart = function (course) {
  const items = [...this.cart.items]; /* клонируем массив, чтобы избежать мутаций */

  const idx = items.findIndex(c => { /* ищем в массиве курс, который нужно обработать */
    return c.courseId.toString() === course._id.toString(); /* приводим к строке, поскольку courseId - объект */
  });

  if (idx >= 0) { /* если элемент уже есть в корзине, увеличиваем количество на единицу */
    items[idx].amount++;
  } else { /* если нет - добавляем */
    items.push({
      courseId: course._id,
      amount: 1
    })
  }

  this.cart = {items}; /* обновляем корзину */
  return this.save()
};

userSchema.methods.removeFromCart = function (id) {
  let items = [...this.cart.items];
  const idx = items.findIndex(c => c.courseId.toString() === id.toString());

  if (items[idx].amount === 1) {
    items = items.filter(c => c.courseId.toString() !== id.toString())
  } else {
    items[idx].amount--;
  }

  this.cart = {items};
  return this.save()
};

userSchema.methods.clearCart = function () {
  this.cart = {items: []};
  return this.save()
};

module.exports = model('User', userSchema);
