$(document).ready(function () {
 
  $(window).scroll(function () {
    if ($(this).scrollTop() > 100) {
      $('#backToTop').fadeIn();
    } else {
      $('#backToTop').fadeOut();
    }
  });
  $('#backToTop').click(function () {
    $('html, body').animate({ scrollTop: 0 }, 800);
    return false;
  });

 
  $('#commentForm')?.on('submit', function (e) {
    e.preventDefault();
    alert('Comment posted successfully!');
    this.reset();
  });

  
  $('#contactForm')?.on('submit', function (e) {
    e.preventDefault();
    alert('Message sent!');
    this.reset();
  });

  
  $('#loginForm')?.on('submit', function (e) {
    e.preventDefault();
    alert('Login successful!');
  });
});
