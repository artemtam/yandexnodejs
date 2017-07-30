const MyForm = {
    validate: () => {
        const formData = MyForm.getData();

        const errorFields = [];
        let isValid = true;

        if (!(/^([\S]+)\s([\S]+)\s([\S]+)$/.test(formData.fio))) {
            isValid = false;
            errorFields.push('fio');
        }

        if (!(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@(ya.ru|yandex.ru|yandex.ua|yandex.by|yandex.kz|yandex.com)$/.test(formData.email))) {
            isValid = false;
            errorFields.push('email');
        }

        if (!(/^\+7\(([0-9]{3})\)([0-9]{3})-([0-9]{2})-([0-9]{2})$/.test(formData.phone))) {
            isValid = false;
            errorFields.push('phone');
        } else {
            let sum = 0;
            for (let i = 0; i < formData.phone.length; i++)
                if (/[0-9]/.test(formData.phone[i]))
                    sum += parseInt(formData.phone[i]);
            if (sum > 30) {
                isValid = false;
                errorFields.push('phone');
            }
        }

        return {isValid, errorFields};
    },
    getData: () => {
        const inputs = document.querySelectorAll('#myForm input');
        const formData = {};

        [].forEach.call(inputs, (input) => {
            formData[input.name] = input.value;
        });

        return formData;
    },
    setData: (formData) => {
        for (let input in formData) {
            if (formData.hasOwnProperty(input)) {
                document.querySelector(`input[name=${input}]`).value = formData[input];
            }
        }
    },
    submit: () => {
        const myform = document.getElementById('myForm');
        [].forEach.call(myform.querySelectorAll('input'), (input) => {
            input.className = '';
        });

        const form = MyForm.validate();

        if (!form.isValid) {
            form.errorFields.forEach((input) => {
                document.querySelector(`input[name=${input}]`).classList.add('error');
            });
        } else {
            let requestTimeout;

            const options = {
                method: myform.method,
                body: JSON.stringify(MyForm.getData()),
                credentials: 'include'
            };

            (function sendRequest() {
                fetch(new Request(myform.action, options)).then((response) => {
                    return response.json();
                }).then((response) => {
                    const resultContainer = document.getElementById('resultContainer');
                    resultContainer.className = response.status;
                    if (response.status === 'success') {
                        resultContainer.innerHTML = 'Success';
                        clearTimeout(requestTimeout);
                    } else if (response.status === 'error')
                        resultContainer.innerHTML = response.reason;
                    else if (response.status === 'progress') {
                        requestTimeout = setTimeout(sendRequest, response.timeout);
                        resultContainer.innerHTML = 'Progress';
                    }
                });
            })();
        }
    }
};

window.onload = () => {
    document.getElementById('myForm').onsubmit = () => {
        MyForm.submit();
        return false;
    }
};