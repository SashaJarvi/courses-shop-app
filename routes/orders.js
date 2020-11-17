const {Router} = require('express');
const Order = require('../models/order');
const auth = require('../middlewares/auth');
const router = Router();

router.get('/', auth, async (req, res) => {
  try {
    /* получаем все заказы для данного пользователя */
    const orders = await Order.find({'user.userId': req.user._id})
    .populate('user.userId');

    res.render('orders', {
      title: 'Orders',
      isOrders: true,
      orders: orders.map(order => ({
        ...order._doc,
        price: order.courses.reduce((total, c) => {
          return total += c.amount * c.course.price
        }, 0)
      }))
    })
  } catch (e) {
    console.log(e);
  }
});

router.post('/', auth, async (req, res) => {
  try {
    /* получаем содержимое корзины */
    const user = await req.user
      .populate('cart.items.courseId')
      .execPopulate();

    /* получаем читаемый формат курсов */
    const courses = user.cart.items.map(item => ({
      amount: item.amount,
      course: {...item.courseId._doc}
    }));

    /* формируем объект заказа */
    const order = new Order({
      user: {
        name: req.user.name,
        userId: req.user
      },
      courses
    });

    await order.save();
    await req.user.clearCart(); /* clearCart() - кастомный метод для очистки корзины */

    res.redirect('/orders');
  } catch (e) {
    console.log(e)
  }
});

module.exports = router;
