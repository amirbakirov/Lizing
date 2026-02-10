(function () {
    'use strict';

    // Calculator (formulas from Формула.xlsx)
    var calcSubmit = document.getElementById('calc-submit');
    var calcResultValue = document.getElementById('calc-result-value');
    if (calcSubmit && calcResultValue) {
        function parseNum(val) {
            if (val === '' || val === null || val === undefined) return NaN;
            var n = parseFloat(String(val).replace(/\s/g, '').replace(',', '.'));
            return isNaN(n) ? NaN : n;
        }

        function dateToMs(dateStr) {
            if (!dateStr) return NaN;
            var d = new Date(dateStr);
            return isNaN(d.getTime()) ? NaN : d.getTime();
        }

        function daysBetween(fromMs, toMs) {
            return Math.round((toMs - fromMs) / (1000 * 60 * 60 * 24));
        }

        function formatMoney(num) {
            if (num === null || num === undefined || isNaN(num)) return '—';
            var n = Number(num);
            return n.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }

        function runCalc() {
            var price = parseNum(document.getElementById('calc-price').value);
            var advance = parseNum(document.getElementById('calc-advance').value) || 0;
            var total = parseNum(document.getElementById('calc-total').value);
            var payments = parseNum(document.getElementById('calc-payments').value);
            var realization = parseNum(document.getElementById('calc-realization').value);
            var extra = parseNum(document.getElementById('calc-extra').value) || 0;
            var dateStart = document.getElementById('calc-date-start').value;
            var dateEnd = document.getElementById('calc-date-end').value;
            var dateSeizure = document.getElementById('calc-date-seizure').value;

            var startMs = dateToMs(dateStart);
            var endMs = dateToMs(dateEnd);
            var seizureMs = dateToMs(dateSeizure);

            if (isNaN(price) || isNaN(total) || isNaN(payments) || isNaN(realization)) {
                calcResultValue.textContent = '—';
                calcResultValue.classList.remove('is-negative', 'is-positive');
                return;
            }

            // E3: Сумма финансирования = Цена приобретения - Аванс
            var financingSum = price - advance;

            // B22: Срок договора лизинга, дн. = Дата окончания - Дата начала
            var contractDays = daysBetween(startMs, endMs);
            if (contractDays <= 0 || isNaN(contractDays)) {
                calcResultValue.textContent = '—';
                calcResultValue.classList.remove('is-negative', 'is-positive');
                return;
            }

            // B25: Срок финансирования, дн. = (Дата изъятия - Дата начала) + 60
            var financingDays = daysBetween(startMs, seizureMs) + 60;
            if (isNaN(financingDays) || financingDays < 0) {
                calcResultValue.textContent = '—';
                calcResultValue.classList.remove('is-negative', 'is-positive');
                return;
            }

            // E6: Плата за финансирование, % = ((Общая сумма - Аванс - Сумма финансирования) / (Сумма финансирования * Срок договора в днях)) * 365 * 100
            var feePct = financingSum > 0 && contractDays > 0
                ? ((total - advance - financingSum) / (financingSum * contractDays)) * 365 * 100
                : 0;

            // E9: Плата за финансирование, руб. = (E3 * E6 * B9) / (365 * 100), где B9 = B25
            var feeRub = (financingSum * feePct * financingDays) / (365 * 100);

            // E12: Расходы = Сумма финансирования + Плата за финансирование руб. + Прочие расходы (B13)
            var expenses = financingSum + feeRub + extra;

            // E15: Доходы = Платежи по договору - Аванс + Цена реализации
            var income = payments - advance + realization;

            // E18: Сальдо = Доходы - Расходы
            var balance = income - expenses;

            calcResultValue.textContent = formatMoney(balance);
            calcResultValue.classList.remove('is-negative', 'is-positive');
            if (balance < 0) calcResultValue.classList.add('is-negative');
            else if (balance > 0) calcResultValue.classList.add('is-positive');
        }

        calcSubmit.addEventListener('click', runCalc);
        document.querySelectorAll('.calc [data-input]').forEach(function (el) {
            el.addEventListener('input', runCalc);
            el.addEventListener('change', runCalc);
        });
    }

    // FAQ accordion
    var faqItems = document.querySelectorAll('[data-faq]');
    faqItems.forEach(function (item) {
        var question = item.querySelector('.faq__question');
        var toggle = item.querySelector('.faq__toggle');
        if (!question || !toggle) return;

        function open() {
            faqItems.forEach(function (other) {
                if (other !== item) other.classList.remove('is-open');
            });
            item.classList.add('is-open');
        }

        function close() {
            item.classList.remove('is-open');
        }

        function toggleOpen() {
            if (item.classList.contains('is-open')) {
                close();
            } else {
                open();
            }
        }

        question.addEventListener('click', function (e) {
            if (e.target === toggle) return;
            toggleOpen();
        });

        toggle.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            toggleOpen();
        });
    });

    // Contact form submit (placeholder)
    var form = document.getElementById('mainForm');
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            // Здесь можно подключить отправку на сервер или в CRM
            alert('Заявка отправлена. Мы свяжемся с вами в ближайшее время.');
        });
    }
})();
