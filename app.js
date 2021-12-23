// Budget Module
var budgetController = (function () {
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        };
        
    };

    Expense.prototype.getPercentage = function () {
        return this.percentage;
    };

    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var data = {
        allItems: {
            exp : [],
            inc : [],
        },

        totals: {
            exp : 0,
            inc : 0,
        },

        budget: 0,

        percentage: -1,
    };

    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function(cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    };

    return {
        addItem: function(type, des, val) {
            var newItem, ID;
            
            // Create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            

            // Create new item based on the type , exp or inc
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            // Push the item into the data structure
            data.allItems[type].push(newItem);

            // Return the item
            return newItem;
        },

        deleteItem: function (type, id) {
            var ids, index;
            
            ids = data.allItems[type].map(function(current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function () {
            // calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // calculate the budget (income - expenses)
            data.budget = data.totals.inc - data.totals.exp;

            // calculate the percentage of income
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },

        calculatePercentages: function () {
            data.allItems.exp.forEach(function (cur) {
                cur.calcPercentage(data.totals.inc);
            });
        },

        getPercentages: function () {
            var allPerc;
            allPerc = data.allItems.exp.map(function (cur) {
                return cur.getPercentage();
            });

            return allPerc;
        },

        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage,
            };
        },

    };
})();


// UI Module
var UIController = (function () {
    var DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensePercLabel: '.item__percentage',
        dateLabel: '.budget__title--month',
    };


    function formatNumber  (num, type) {
        var numSplit, int, dec, sign;

        num = Math.abs(num).toFixed(2);
        numSplit = num.split('.');
        int = numSplit[0];
        dec = numSplit[1];

        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3 , 3);
        }

        type === 'exp' ? sign = '-' : sign = '+';

        return sign + ' ' + int + '.' + dec;
    };


    function nodeListForEach (list, callback) {
        for (var i = 0 ; i < list.length ; i++) {
            callback(list[i], i);
        };
    };

    return {
        getInput: function() {
            return {
                type : document.querySelector(DOMStrings.inputType).value,
                description : document.querySelector(DOMStrings.inputDescription).value,
                value : parseFloat(document.querySelector(DOMStrings.inputValue).value),
            }
        },

        addListItem : function (obj, type) {
            var html, newHtml, element;
            
            // Create HTML string with placeholder text
            if (type === 'inc') {
                element = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMStrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } 
        
            // Replace the placeholder text with the object data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
        },

        deleteListItem: function (selectorID) {
            var element;

            element = document.getElementById(selectorID);
            element.parentNode.removeChild(element);
        },

        clearFields: function () {
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);

            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(current => {
                current.value = "";
            });

            fieldsArr[0].focus();
        },

        displayMonth: function () {
            var now, month, monthsArray, year;
            now = new Date();
            month = now.getMonth();
            monthsArray = ['January' , 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'Septemeber', 'October', 'November', 'December',]
            year = now.getFullYear();
            document.querySelector(DOMStrings.dateLabel).textContent = monthsArray[month] + ' ' + year;
        },

        getDOMStrings: function () {
            return DOMStrings;
        },

        displayBudget: function (obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.budget, 'inc');
            document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.budget, 'exp');
            

            if (obj.percentage > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '--';
            };
        },

        changeType: function () {
            var fields;

            fields = document.querySelectorAll(
                DOMStrings.inputType + ',' +
                DOMStrings.inputDescription + ',' + 
                DOMStrings.inputValue
            );

            nodeListForEach(fields, function (cur) {
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
        },

        displayPercentages: function (percentages) {
            var fields = document.querySelectorAll(DOMStrings.expensePercLabel);

            nodeListForEach(fields, function (current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '--';
                }
            });
        },
    }

})();

// App Module
var controller = (function (budgetCtrl, UICtrl) {
    var setupEventListeners = function () {
        var DOM = UICtrl.getDOMStrings();

        // Listen for clicking the add button or pressing enter
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function (event) {
            // Response only if Enter is pressed
            if (event.key === 'Enter') {
                ctrlAddItem();
            }
        });

        // Listen for clicking the remove button
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        // Listen for changing the type
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);
    };    

    var updateBudget = function () {
        // 1. Calculate the budget
        budgetCtrl.calculateBudget();

        // 2. Return the budget
        var budget = budgetCtrl.getBudget();

        // 3. add the budget to the UI
        UICtrl.displayBudget(budget);
    };

    var updatePercentages = function () {
        var percentages;
        // 1. Calculate the percentages
        budgetCtrl.calculatePercentages();

        // 2. Read percentages from the budget controller
        percentages = budgetCtrl.getPercentages();

        // 3. Update the UI with the new percentages
        UICtrl.displayPercentages(percentages);
    };

    var ctrlAddItem = function () {
        var input, newItem;

        // 1. Get the field input data
        input = UICtrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // 2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            // 4. Clear the fields
            UICtrl.clearFields(); 

            // 5. Calculate and update budget
            updateBudget();

            // 6. Calculate and update percentage
            updatePercentages();
        };        
    };

    var ctrlDeleteItem = function (event) {
        var itemID, splitID, type, id;
        
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            id = parseInt(splitID[1]) ;
            
            // 1. delete the item from the data structure
            budgetCtrl.deleteItem(type, id);

            // 2. delete the item from the UI
            UICtrl.deleteListItem(itemID);

            // 3. update and display the new budget
            updateBudget();

            // 4. Calculate and update percentage
            updatePercentages();

        }
    };

    return {
        init: function() {
            console.log('OK');
            UICtrl.displayBudget(
                {
                    budget: 0,
                    totalInc: 0,
                    totalExp: 0,
                    percentage: -1,
                }
            );
            setupEventListeners();

            UICtrl.displayMonth();
        },
    };

})(budgetController, UIController);

controller.init();