'use strict';

$('.orders-box__list').sortable({
  connectWith: '.orders-box__list',
  placeholder: 'order-card__placeholder'
}).disableSelection(); //
//
//

var ordersBoxHeadings = $('.orders-box__headings'); //полифилл для position: sticky для ie

Stickyfill.add(ordersBoxHeadings);
$(window).on('scroll', function () {
  if (ordersBoxHeadings[0].getBoundingClientRect().top <= 0) {
    ordersBoxHeadings.addClass('orders-box__headings_scrolled');
  } else if (ordersBoxHeadings[0].getBoundingClientRect().top > 0) {
    ordersBoxHeadings.removeClass('orders-box__headings_scrolled');
  }
});
var showGoodsButton = $('.icons-block__item__goods');
var allGoods = $('.all-goods');
showGoodsButton.on('click', function (event) {
  event.preventDefault();
  $(this).parent().next('.all-goods').toggleClass('all-goods_hidden');
});