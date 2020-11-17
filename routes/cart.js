const {Router} = require('express');
const Course = require('../models/course');
const auth = require('../middlewares/auth');
const router = Router();

/* создаем отдельную функцию-хэлпер */
function mapCartItems(cart) {
  return cart.items.map(c => ({
    ...c.courseId._doc,
    id: c.courseId.id,
    amount: c.amount
  }))
}

/* считаем общую цену курсов в корзине */
function computePrice(courses) {
  return courses.reduce((total, course) => {
    return total += course.price * course.amount;
  }, 0)
}

router.post('/add', auth, async (req, res) => {
  const course = await Course.findById(req.body.id);
  /* вызываем созданный нами метод addToCart(), куда передаем созданный нами курс */
  await req.user.addToCart(course);
  res.redirect('/cart');
});

router.get('/', auth, async (req, res) => {
  // const cart = await Cart.fetch();
  /* получаем корзину пользователя */
  const user = await req.user
    .populate('cart.items.courseId')
    .execPopulate();

  const courses = mapCartItems(user.cart);

  res.render('cart', {
    title: 'Cart',
    isCart: true,
    courses: courses,
    price: computePrice(courses)
  });
});

router.delete('/remove/:id', auth, async (req, res) => { /* реализуем роут для удаления элемента из корзины */
  await req.user.removeFromCart(req.params.id);
  const user = await req.user
    .populate('cart.items.courseId')
    .execPopulate();

  const courses = mapCartItems(user.cart);
  const cart = {
    courses,
    price: computePrice(courses)
  };

  res.json(cart);
});

module.exports = router;
