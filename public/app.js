const priceElem = document.querySelectorAll('.price');
const dateElem = document.querySelectorAll('.date');
const tabsElem = document.querySelectorAll('.tabs');

const toCurrency = price => {
  return new Intl.NumberFormat('ru-RU', {
    currency: 'rub',
    style: 'currency'
  }).format(price)
};

const toDate = date => {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(new Date(date))
};

dateElem.forEach(node => {
  node.textContent = toDate(node.textContent)
});

priceElem.forEach(node => {
  node.textContent = toCurrency(node.textContent);
});

const $cart = document.querySelector('#cart');

if ($cart) {
  $cart.addEventListener('click', e => {
    if (e.target.classList.contains('js-remove')) {
      const id = e.target.dataset.id;
      const csrf = e.target.dataset.csrf;

      fetch(`/cart/remove/${id}`, {
        method: 'delete',
        headers: {
          'X-XSRF-TOKEN': csrf
        }
      }).then(res => res.json())
        .then(cart => {
          if (cart.courses.length) {
            const html = cart.courses.map(c => {
              return `
                <tr>
                  <td>${c.title}</td>
                  <td>${c.amount}</td>
                  <td>
                    <button class="btn btn-small js-remove" data-id="${c.id}">Remove</button>
                  </td>
                </tr>
              `
            }).join('');
            $cart.querySelector('tbody').innerHTML = html;
            $cart.querySelector('.price').textContent = toCurrency(cart.price);
          } else {
            $cart.innerHTML = '<p>The cart is empty</p>'
          }
        })
    }
  })
}

M.Tabs.init(tabsElem);
