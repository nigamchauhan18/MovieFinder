let contactForm = document.querySelector('#contactForm');

let contactName = document.querySelector('#contactName');
let contactEmail = document.querySelector('#contactEmail');
let contactSubject = document.querySelector('#contactSubject');
let contactMessage = document.querySelector('#contactMessage');

let nameError = document.querySelector('#nameError');
let emailError = document.querySelector('#emailError');
let subjectError = document.querySelector('#subjectError');
let messageError = document.querySelector('#messageError');

contactName.addEventListener('input', () => {
    if (contactName.value !== "") {
        nameError.style.display = 'none';
    } else {
        nameError.style.display = 'block' 
    }
});
contactEmail.addEventListener('input', () => {
    if (contactEmail.value !== "") {
        emailError.style.display = 'none';
    } else {
        emailError.style.display = 'block' 
    }
});
contactSubject.addEventListener('input', () => {
    if (contactSubject.value !== "") {
        subjectError.style.display = 'none';
    } else {
        subjectError.style.display = 'block' 
    }
});
contactMessage.addEventListener('input', () => {
    if (contactMessage.value !== "") {
        messageError.style.display = 'none';
    } else {
        messageError.style.display = 'block' 
    }
});

contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    let user = localStorage.getItem('user');
    if (!user) {
        window.location.href = '/signup.html';
        return;
    }
    
    let isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
        window.location.href = '/login.html';
        return;
    }

    let valid = true;
    if (contactName.value === "") {
        nameError.style.display = 'block';
        nameError.textContent = "Please enter your name.";
        valid = false;
    }
    if (contactEmail.value === "") {
        emailError.style.display = 'block';
        emailError.textContent = "Please enter your email address.";
        valid = false;
    }
    if (contactSubject.value === "") {
        subjectError.style.display = 'block';
        subjectError.textContent = "Please select a subject.";
        valid = false;
    }
    if (contactMessage.value.length < 10) {
        messageError.style.display = 'block';
        messageError.textContent = "Message must contain at least 10 characters.";
        valid = false;
    }
    if (!valid) {
        return;
    }

    let templateParams = {
        from_name: contactName.value.trim(),
        from_email: contactEmail.value.trim(),
        subject: contactSubject.value,
        message: contactMessage.value.trim()
    };

    try {
        await emailjs.send('service_3nlurua', 'template_t39rtwl',
            templateParams, {
                publicKey: 'wGzfZlCf9ItV-tkqU'
            }
        );
        let contactInfo = JSON.parse(localStorage.getItem('contactInfo')) || [];
        contactInfo.unshift({
            contactName: contactName.value,
            contactEmail: contactEmail.value,
            contactSubject: contactSubject.value,
            contactMessage: contactMessage.value,
        });
        localStorage.setItem('contactInfo', JSON.stringify(contactInfo));
        alert('Your message has been sent successfully!');
        contactForm.reset();
    } catch (error) {
        console.error('Email sending failed:', error);
        alert('Unable to send your message. Please try again later.');
    }
});
