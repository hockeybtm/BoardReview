// Load templates for backbone
$(ensureLoggedIn);

function ensureLoggedIn() {
    mw.loader.load('mediaWiki.user');
    if ($.isEmptyObject(wgUserName)) {
        alert("Please Log In To Continue.");
        window.location.replace("http://wikidoc.org/index.php?title=Special:UserLogin&returnto=User%3AMatt+Pijoan");
    } else {
        $( "#TEMPLATE_BIN" ).load( "http://cdn.brian-meyers.com/brian/templates.html", function () {
            Backbone.history.start();
            curriculumType();
            initiliazeDOM();
        });
    }
}

function curriculumType() {
    var options = {
        examtype: null,
        timer: null,
        qbank: null,
        searchMethod: null,
        timer: null,
        examType: '',
        timeAmt: 0,
        questionListAll: new Array(),
        numQuestion: null,
        currentQuestion: 0,
        examQuestions: new Array(),
        isParsed: 0,
        answeredRight: 0,
        Question: {
            PageName: null,
            PageAuthor: null,
            Prompt: null,
            RightAnswer: ' ',
            AnswerA: null,
            AnswerB: null,
            AnswerC: null,
            AnswerD: null,
            AnswerE: null,
            AnswerAExp: null,
            AnswerBExp: null,
            AnswerCExp: null,
            AnswerDExp: null,
            AnswerEExp: null,
            selectedAnswer: 'F',
            lastParsed: 0,
            creditReceived: false
        }
    }
    window.exam = options;
    // var background_html = "<div class='container'><header><h1 class='animated bounceInDown'>Wikidoc Board Review </br> <span>Please select an exam below</span></h1></header></div>";
    // $("#chooseQBank").html(background_html);
    // var stuffs = "<div class='round-button Curric' id='MCAT'><div class='round-button-circle'><p class='round-button' style='font-size:2.5em;'>MCAT</p></div></div><div id='spacer'  style='display: inline'></div>";
    // stuffs += "<div class='round-button Curric' id='USMLE Step 1'><div class='round-button-circle'><p class='round-button'>1</p></div></div><div id='spacer'  style='display: inline'></div>";
    // stuffs += "<div class='round-button Curric' id='USMLE Step 2 CK'><div class='round-button-circle'><p class='round-button'>2</p></div></div><div id='spacer'  style='display: inline'></div>";
    // stuffs += "<div class='round-button Curric' id='USMLE Step 3'><div class='round-button-circle'><p class='round-button'>3</p></div></div><div id='spacer'  style='display: inline'></div>";
    // stuffs += "<div class='round-button Curric' id='Board Review'><div class='round-button-circle'><p class='round-button' style='font-size:2.5em;'>ABIM</p></div></div><div id='spacer'  style='display: inline'></div><br /><br />";
    // stuffs += "<div class='stepBar'><img src='http://static.wikidoc.org/f/f3/Step_bar_5_22_14.png' /></div>";
    // $("#chooseQBank").html(background_html + "<div class='examButtons'>" + stuffs + "</div>");

    $('.Curric').click(options, selectExamOptions);

}

function selectExamOptions(event) {
    window.exam.examtype = $(this).attr('id');
    $("#chooseQBank").hide()
    $("#testOptions").show()

    window.exam.qbank = 'Pat'
    window.exam.timeAmt = parseInt($(this).attr("id"), 10) * 6000;
    $('#newExamBigButton').click(function() {
        $('#newExamArrow').css({
            opacity: 1
        });
        $('#newExamArrow').show()
        $('#myExamsArrow').css({
            opacity: 0
        });
        $('#examOptions').show();
        $('#myExamBigButton').addClass('examButtonNotSelected');
        $('#newExamBigButton').removeClass('examButtonNotSelected');
        $('#wjgContainer').hide()
    });

    $('#myExamBigButton').click(function() {
        $('#myExamsArrow').css({
            opacity: 1
        });
        $('#myExamsArrow').show();
        $('#newExamArrow').css({
            opacity: 0
        });
        $('#examOptions').hide();
        $('#newExamBigButton').addClass('examButtonNotSelected');
        $('#myExamBigButton').removeClass('examButtonNotSelected');
        $('#wjgContainer').show()
        if (window.exam.performanceQueriesRun == null) {
            window.exam.performanceQueriesRun = 1
            runPerformanceQuery();
        }
    });

    $("input:radio[name=examMode]").click(function() {
        var value = $(this).val();
        console.log(value)
        window.exam.examType = value
    });

    $("input:radio[name=CatKey]").click(function() {
        var value = $(this).val();
        console.log(value)
        window.exam.searchMethod = value
        if (value == 'Keyword') {
            Keywords(window.exam)
        }
    });

    $("input:radio[name=TimerOptions]").click(function() {
        var value = $(this).val();
        var tempTime = parseInt(value, 10) * 6000;
        console.log(tempTime);
        window.exam.timeAmt = tempTime;
    });

    countCats()
};

function runPerformanceQuery() {
    var r = $.Deferred();
    var api = new mw.Api();
    api.get({
        action: 'userExamQuery',
        username: wgUserName,
        format: 'json'
    })
        .always(function(data) {
            $.each(data.userExamQuery[0], function(index, value) {
                var outstring = "";
                var timeBegin = "";
                var timeEnd = "";
                var scoreString = "";
                if (value.begin != null) {
                    timeBegin = new Date(value.begin * 1000).toDateString();
                }
                if (value.end != null) {
                    timeEnd = new Date(value.end * 1000).toDateString();
                    scoreString = value.score + "%";
                } else {
                    timeEnd = "Unfinished";
                    scoreString = "N/A";
                }
                if ($(value.questions).length > 0) {
                    var wjg_string = "<tr class='odd'>" +
                        "<td>" + value.id + "</td>" +
                        "<td>" + timeBegin + "</td>" +
                        "<td>" + scoreString + "</td>" +
                        "<td>" + timeEnd + "</td>" +
                        "<td>" + value.type + "</td>" +
                        '<td><div class="arrow"></div></td>' +
                        "</tr>" +
                        "<tr style='display:none'>" +
                        '<td colspan="6">' +
                        "<h4>Additional information</h4>" +
                        "<ul>" +
                        "<li>Categories selected: Coming soon</li>" +
                        "<li>Subcategories selected: Coming soon</li>" +
                        "<li>Resume exam! (Coming soon)</li>" +
                        "</ul>" +
                        "</td>" +
                        "</tr>";
                    $("#report tbody").append(wjg_string);
                    outstring += "<div id='" + value.id + "'><span class='cell'>" + value.id + "</span><span class='cell'>" + timeBegin + "</span><span class='cell'>" + scoreString + "</span><span class='cell'>" + timeEnd + "</span><span class='cell'>" + value.type + "</span>";
                    outstring += "<div>";
                    // $.each(value.questions, function(ind, val){
                    // outstring += val.title+"<br />";
                    // });
                    // outstring += "</div>"
                    // outstring += "</div>";
                    // $("#metrics").append(outstring);
                    //  $("#"+value.id).makeCollapsible();
                }
            });
        });
    setTimeout(function() {
        // and call `resolve` on the deferred object, once you're done
        r.resolve();
        $("tr.odd").click(function() {
            $(this).next("tr").toggle();
            $(this).find(".arrow").toggleClass("up");
        });
    }, 2500);
    return r
    $("tr:odd").addClass("odd");
    $("tr:not(.odd)").hide();
    $("tr:first-child").show();

    $("tr.odd").click(function() {
        $(this).next("tr").toggle();
        $(this).find(".arrow").toggleClass("up");
    });
};

function categoryOrKeyword(event) {
    window.exam.examType = $(this).attr('id');
    var buttons = '';
    buttons = "<div id='Category' class='noSelect WBRButton CoK'><br />Category</div><div id='Keyword' class='noSelect WBRButton CoK'><br />Keyword</div><br /><br /><br />";
    $("#exam").append(buttons);
    $('.CoK').click(window.exam, timerToggle);
}

function timerToggle(event) {
    window.exam.searchMethod = $(this).attr('id');
    var form = null;
    form = "<div id='yes' class='noSelect WBRButton stepThree'><br />Enable Timer</div><div id='nop' class='noSelect WBRButton stepThree'><br />Disable Timer</div><br /><br /><br />";
    if ($("#exam").find('#yes').length == 0) {
        $("#exam").append(form);
    }
    $('#yes').click(window.exam, timerDuration);

    if (window.exam.searchMethod === "Category") {
        $('#nop').click(window.exam, countCats);
    } else {
        $('#nop').click(window.exam, Keywords);
    }
}

function timerDuration(event) {
    window.exam.timer = true;
    var form = null;
    form = "<div id='1' class='noSelect WBRButton stepFour'><br />1 Minute</div><div id='10' class='noSelect WBRButton stepFour'><br />10 Minute</div><div id='20' class='noSelect WBRButton stepFour'><br />20 Minutes</div><div id='40' class='noSelect WBRButton stepFour'><br />40 Minutes</div><br /><br /><br />"
    if ($("#exam").find('#1').length == 0) {
        $("#exam").append(form);
    }
    if (window.exam.searchMethod === "Category") {
        $('.stepFour').click(window.exam, countCats);
    } else {
        $('.stepFour').click(window.exam, Keywords);
    }
}

function Keywords(event) {
    $('#CategorySelectorDiv').hide()
    var stuffs = "<div id='formSpace'></div><div class='WBRButton' id='orOp'><br />OR</div><div class='WBRButton' id='andOp'><br />AND</div><div class='WBRButton' id='showQueries'><br />SHOW</div><br /><br /><br />";
    $("#examOptions").append(stuffs);
    var orBox = "<div class='query'> <input type='text' class='queryString' /> </div><br />";
    var andBox = " <input type='text' class='queryString' /> ";
    $("#formSpace").html(orBox);
    $(".queryString").focus(function() {
        $(".focused").removeClass("focused");
        $(this).parent().addClass("focused");
        $(".queryString").focusout(function() {
            if ($(this).val().length <= 1) {
                $(this).remove();
            }
        });
    });

    $("#orOp").click(function() {
        $("#formSpace").append(orBox);
        $(".queryString").focus(function() {
            $(".focused").removeClass("focused");
            $(this).parent().addClass("focused");
            $(".queryString").focusout(function() {
                if ($(this).val().length <= 1) {
                    $(this).remove();
                }
            });
        });
    });

    $("#andOp").click(function() {
        var andBox = "<input type='text' class='queryString' />";
        $(".focused").append(andBox);
        $(".queryString").focus(function() {
            $(".focused").removeClass("focused");
            $(this).parent().addClass("focused");
            $(".queryString").focusout(function() {
                if ($(this).val().length <= 1) {
                    $(this).remove();
                }
            });
        });
    });

    $("#showQueries").click(window.exam, showQueries);

    function showQueries(event) {
        $("#removeNum").remove();
        window.exam.queries = [];
        window.exam.questionListAll = [];
        window.exam.keyword = {};
        window.exam.keyword.iterator = 0;
        $.each($(".query"), function(index, value) {
            window.exam.queries[index] = "[[ExamType::" + window.exam.examtype + "]]";
            $.each($(this).children(), function(ind, val) {
                window.exam.queries[index] += "[[WBRKeyword::" + $(this).val() + "]]";
            });
        });
        runQueries(window.exam);
    }

    function runQueries(obj) {
        var api = new mw.Api();
        api.get({
            action: 'ask',
            query: obj.queries[obj.keyword.iterator],
            format: 'json'
        })
            .always(function(data) {
                $.each(data.query.results, function(index, value) {
                    obj.questionListAll.push(value.fulltext);
                });
                if ((obj.keyword.iterator + 1) < obj.queries.length) {
                    obj.keyword.iterator++;
                    runQueries(obj);
                } else {
                    removeDuplicates(obj);
                }
            });
    }

    function removeDuplicates(obj) {
        if (window.exam.questionListAll.length > 45) {
            obj.maxQ = 45;
        } else {
            obj.maxQ = window.exam.questionListAll.length;
        }
        var output = "<div id='removeNum'><b>Choose the number of questions you would like to answer. The maximum number of questions you can select is <span id='countShow'>" + obj.maxQ + "</span>.</b><br /><br /><br />Number of questions:<input type='text' id='numQues' /><br /><br /><div id='Go' class='noSelect WBRButton'>Click here to begin the exam</div></div>";
        if ($("#examOptions").find('#numQues').length == 0) {
            $("#examOptions").append(output);
        } else {

            alert('Please ensure you have valid keywords entered');
        }

        $("#Go").click(obj, TNG);
    }
}

function TNG(event) {
    if (window.exam.examtype == null || window.exam.examType == '' || window.exam.examtype == null || window.exam.qbank == null || window.exam.searchMethod == null || window.exam.timeAmt == null) {
        alert('Please ensure all exam options are selected.');
        return;
    };
    window.exam.numQuestion = $("#numQues").val();
    if (window.exam.numQuestion > 0 && window.exam.numQuestion <= 45) {
        loadNextQuestion(window.exam);
    } else {
        alert('Invalid number of questions entered.');
    }
}

function selectCats() {
    console.log('Running SelectCats')
    var categories = [];
    var table = null;
    table = "<br /><h3 class='examOptionTitle'>Select All That Apply:</h3><br /><br /><br />";;
    if (window.exam.examtype === "MCAT") {
        categories['main'] = new Array("Biology", "Cell", "Enzymes", "Microbiology", "Cellular Metabolism", "Reproduction", "Embryology", "Musculoskeletal System", "Digestive System ", "Excretory System", "Respiratory System", "Skin", "Circulatory System", "Immune System", "Homeostasis", "Endocrine System", "Nervous System ", "Genetics", "Evolution", "Organic Chemistry", "Nomenclature", "Bonding/Structure", "Isomers", "Alkanes", "AlkenesAlkynes", "Haloalkanes", "Aromatic Compounds", "Alcohols", "Ethers", "Aldehydes ", "Ketones", "Carboxylic Acid", "Carboxylic Acid Derivatives", "Amines", "Nitrogen Containing Compounds", "Purification", "Spectroscopy", "Separations", "Carbohydrates", "Amino Acids", "Peptides", "Proteins", "Nucleic", "Acids", "Chemistry", "Atomic Structure", "Periodic Table", "Phases", "Gases", "Bonding", "Stoichiometry", "Kinetics", "Thermochemistry", "Phases", "Solutions", "Acids and Bases", "Redox Reactions", "Electrochemistry", "Physics", "Kinematics", "Fluids", "Solids", "Newtonian Mechanics", "Momentum", "Energy", "Thermodynamics", "Electrostatics", "Magnetism", "DC Circuits", "AC Circuits", "Periodic Motion", "Waves", "Sound", "Optics", "Light", "Atomic Phenomena", "Nuclear Phenomena");
        for (var i = 0; i < categories['main'].length; i++) {
            table += "<td><input type='checkbox' name='MainCat' value='" + categories['main'][i] + "' />" + categories['main'][i] + "</td>";
            if ((i + 1) % 4 == 0) {
                table += "</tr><tr>";
            }
        }
    } else {

        if (window.exam.examtype === "USMLE Step 1") {
            categories['main'] = new Array("Anatomy", "Behavioral Science/Psychiatry", "Biochemistry", "Biostatistics/Epidemiology", "Embryology", "Ethics", "Genetics", "Histology", "Immunology", "Microbiology", "Pathology", "Pathophysiology", "Pharmacology", "Physiology");
            categories['sub'] = new Array("Cardiology", "Dermatology", "Endocrine", "Gastrointestinal", "Genitourinary", "Head and Neck", "Hematology", "Musculoskeletal/Rheumatology", "Neurology", "Oncology", "Pulmonology", "Reproductive", "Renal", "Vascular", "General Principles", "Infectious Disease");
        } else if (window.exam.examtype === "USMLE Step 2 CK") {
            categories['main'] = new Array("Internal medicine", "Surgery", "OB/GYN", "Pediatrics", "Psychiatry");
            categories['sub'] = new Array("Allergy/Immunology", "Cardiovascular", "Dermatology", "Endocrine", "Gastrointestinal", "Hepatology", "Genitourinary", "Head and Neck", "Hematology", "Infectious Disease", "Musculoskeletal/Rheumatology", "Neurology", "Obstetrics and Gynecology", "Oncology", "Ophthalmology", "Pediatrics", "Poisoning", "Preventive Medicine", "Psychiatry", "Respiratory", "Surgery", "Biostatistics/ Epidemiology", "Ethics", "Electrolytes", "Genetics", "Miscellaneous");
        } else if (window.exam.examtype === "USMLE Step 3") {
            categories['main'] = new Array("Community Medical Health Center", "Primary Care Office", "Inpatient Facilities", "Emergency Room");
            categories['sub'] = new Array("Allergy/Immunology", "Cardiovascular", "Dermatology", "Endocrine", "Gastrointestinal", "Hepatology", "Genitourinary", "Head and Neck", "Hematology", "Infectious Disease", "Musculoskeletal/Rheumatology", "Neurology", "Obstetrics and Gynecology", "Oncology", "Ophthalmology", "Pediatrics", "Poisoning", "Preventive Medicine", "Psychiatry", "Respiratory", "Surgery", "Biostatistics/Epidemiology", "Ethics", "Electrolytes", "Genetics", "Miscellaneous");
        } else if (window.exam.examtype === "Board Review") {
            categories['main'] = new Array("Adolescent Medicine", "Advanced Heart Failure and Transplant Cardiology", "Allergy & Immunology", "Cardiovascular Disease", "Clinical Cardiac Electrophysiology", "Critical Care Medicine", "Endocrinology", "Diabetes and Metabolism", "Gastroenterology", "Geriatric Medicine", "Hematology", "Hospice & Palliative Medicine", "Hospital Medicine", "Focused Practice", "Infectious Disease", "Internal Medicine", "Interventional Cardiology", "Medical Oncology", "Nephrology", "Pulmonary Disease", "Rheumatology", "Sleep Medicine", "Sports Medicine", "Transplant Hepatology");
            categories['sub'] = new Array("Anesthesiology", "Dermatology", "Emergency Medicine", "Emergency Medicine/Critical Care Medicine", "Family Medicine", "Medical Genetics", "Neurology", "Nuclear Medicine", "Pediatrics", "Physical Medicine & Rehab", "Preventative Medicine", "Psychiatry");
        }
        console.log("checkpoint 1")
        console.log(categories)
        table += "<table id='CategorySelectionTable' style='width:100%;'><tr><td style='width:49%;'><h3 class='examOptionTitle'>Main Category</h3></td><td style='width:49%;'><h3 class='examOptionTitle'>Sub Category</h3></td></tr>";
        if (categories['sub'].length >= categories['main'].length) {}
        var table = "<br /><br /><div id='CategorySelectorDiv'><h3 class='examOptionTitle'>Select All That Apply:</h3><br/>";
        table += "<table style='width:100%;' id ='CategorySelectionTable'><tr><td style='width:49%;'><h3 class='examOptionTitle'>Main Category</h3></td><td style='width:49%;'><h3 class='examOptionTitle'>Sub Category</h3></td></tr>";
        if (categories['sub'].length >= categories['main'].length) {

            for (var i = 0; i < categories['sub'].length; i++) {
                if (categories['main'][i]) {
                    table += "<tr><td><input type='checkbox' name='MainCat' value='" + categories['main'][i] + "' />" + categories['main'][i] + " ( " + exam.arrCounts['category']['main'][categories['main'][i]] + " ) </td><td><input type='checkbox' name='SubCat' value='" + categories['sub'][i] + "' />" + categories['sub'][i] + " ( " + exam.arrCounts['category']['sub'][categories['sub'][i]] + " )</td></tr>";
                } else {
                    table += "<tr><td></td><td><input type='checkbox' name='SubCat' value='" + categories['sub'][i] + "' />" + categories['sub'][i] + " ( " + exam.arrCounts['category']['sub'][categories['sub'][i]] + " ) </td></tr>";
                }
            }
        } else {
            for (var i = 0; i < categories['main'].length; i++) {
                if (categories['sub'][i]) {
                    table += "<tr><td><input type='checkbox' name='MainCat' value='" + categories['main'][i] + "' />" + categories['main'][i] + "</td><td><input type='checkbox' name='SubCat' value='" + categories['sub'][i] + "' />" + categories['sub'][i] + "</td></tr>";
                } else {
                    table += "<tr><td><input type='checkbox' name='MainCat' value='" + categories['main'][i] + "' />" + categories['main'][i] + "</td><td></td></tr>";
                }
            }
        }
        table += "</table><div id='SelectAll' class='noSelect WBRButton'>Select All Main Categories</div><div id='UnselectAll' class='noSelect WBRButton'>Select All Sub Categories</div><br /><br /><br />Second: Click the Count Question Button below to calculate number of questions available:<br /><br /><br /><div id='CountQ' class='noSelect WBRButton'>Count Questions</div><br /><br /><br /></div>"
        if ($("#examOptions").find('#SelectAll').length == 0) {
            $("#examOptions").append(table);
        }
    }
    $("#SelectAll").click(function() {
        if ($("#SelectAll").html() === "Select All Main Categories") {
            $("[name=MainCat]").each(function() {
                $(this).attr('checked', true);
                $("#SelectAll").html("Clear All Main Categories");
            });
        } else {
            $("[name=MainCat]").each(function() {
                $(this).attr('checked', false);
                $("#SelectAll").html("Select All Main Categories");
            });
        }
    });

    $("#UnselectAll").click(function() {
        if ($("#UnselectAll").html() === "Select All Sub Categories") {
            $("[name=SubCat]").each(function() {
                $(this).attr('checked', true);
                $("#UnselectAll").html("Clear All Sub Categories");
            });
        } else {
            $("[name=SubCat]").each(function() {
                $(this).attr('checked', false);
                $("#UnselectAll").html("Select All Sub Categories");
            });
        }
    });

    $("#CountQ").click(window.exam, selectExamLength);
}

function selectExamLength(event) {
    console.log('Running selectExamLength')
    var Main = new Array();
    var Sub = new Array();
    if ($("[name=MainCat]:checked").length > 0 && $("[name=SubCat]:checked").length > 0) {
        $("[name=MainCat]:checked").each(function() {
            Main.push($(this).val());

        });
        $("[name=SubCat]:checked").each(function() {

            Sub.push($(this).val());
        });
        window.exam.mainCat = Main;
        window.exam.subCat = Sub;
        var api = new mw.Api(event, Main, Sub);
        api.get({
            action: 'catcount',
            main: JSON.stringify(Main),
            sub: JSON.stringify(Sub),
            exam: window.exam.examtype,
            format: 'json'
        }, {
            ok: function(res) {
                if (res.Count > 45) {
                    window.exam.maxQ = 45;
                } else {
                    window.exam.maxQ = res.Count;
                }
                var output = "<b>Choose the number of questions you would like to answer. The maximum number of questions you can select is <span id='countShow'>" + window.exam.maxQ + "</span>.</b><br /><br /><br />Number of questions:<input type='text' id='numQues' /><br /><br /><div id='Go' class='noSelect WBRButton'>Click here to begin the exam</div>";
                if ($("#examOptions").find('#numQues').length == 0) {
                    $("#examOptions").append(output);

                }
                $("#Go").click(window.exam, inputValidation);
            }
        });
    } else {
        alert('Please ensure you have both a main and a sub category selected');
    }
}

function inputValidation(event) {
    if (window.exam.examtype == null || window.exam.examType == '' || window.exam.examtype == null || window.exam.qbank == null || window.exam.searchMethod == null || window.exam.timeAmt == null) {
        alert('Please ensure all exam options are selected.');
        return;
    };
    if ($("#numQues").val().length > 0 && parseInt($("#numQues").val(), 10) <= parseInt($("#countShow").html(), 10) && parseInt($("#numQues").val(), 10) > 0) {
        window.exam.numQuestion = $("#numQues").val();
        var api = new mw.Api();
        api.get({
            action: 'newExam',
            username: mw.user.getName(),
            type: window.exam.examtype,
            format: 'json'
        })
            .done(function(data) {
                window.exam.examid = data.newExam.exam_id;
            });
        $('#testOptions').hide()
        $("#exam").show()
        $("#exam").html("<img src='http://static.wikidoc.org/5/51/Index.gif' />");
        if (window.exam.timer) {
            window.exam.examTimer = $.timer(function() {
                var rem = parseInt($("#timeRem").html());
                $('#timerBox').css("visibility", "visible");
                $('#timerBox').html(formatTime(rem));
                if (rem == 0) {
                    window.exam.examTimer.stop();
                    $("#content").click(window.exam, endExam);
                } else {
                    var temp = rem - 7;
                    $("#timeRem").html(temp.toString());
                    if (rem < 0) {
                        $("#timeRem").html("0");
                    }
                }
            }, 70, false);

            window.exam.examTimer.toggle();
        }
        loadNextQuestion();
    } else {
        alert('Invalid entry in number of questions input');
    }
}

function loadNextQuestion() {
    $('#testOptions').hide();
    $('#exam').show()
    window.exam.examQuestions = [];
    if (window.exam.searchMethod === "Category") {
        var api = new mw.Api(window.exam);
        api.get({
            action: 'load',
            main: JSON.stringify(window.exam.mainCat),
            sub: JSON.stringify(window.exam.subCat),
            exam: window.exam.examtype,
            num: window.exam.numQuestion,
            format: 'json'
        }, {
            ok: function(res) {
                var i = 0;
                window.exam.currentQuestion = 0;
                $.each(res.questions.list, function(key, element) {
                    element.PageName = key;
                    window.exam.examQuestions[i] = element;
                    i++;
                });
                addToNavBar(window.exam);
            }
        });
    } else if (window.exam.searchMethod === "Keyword") {
        var api = new mw.Api(window.exam);
        api.get({
            action: 'load',
            keywords: JSON.stringify(window.exam.questionListAll),
            num: window.exam.numQuestion,
            format: 'json'
        }, {
            ok: function(res) {
                var i = 0;
                window.exam.currentQuestion = 0;
                $.each(res.questions.list, function(key, element) {
                    element.PageName = key;
                    window.exam.examQuestions[i] = element;
                    i++;
                });
                addToNavBar();
            }
        });
    }
}

function addToNavBar() {
    $("#exam").html("<div id='navBar'><div id='flag' class='noSelect WBRImgButton'><img src='http://static.wikidoc.org/3/34/Flag_5_19_14.png' /></div><div id='back' class='noSelect WBRImgButton'><img src='http://static.wikidoc.org/f/f9/Leftarrow_3_29_b.png' /></div><div id='next' class='noSelect WBRImgButton'><img src='http://static.wikidoc.org/a/ae/Rightarrow_3_29_14_b.png' /></div><div id='lab_vals' class='noSelect WBRImgButton'><img src='http://static.wikidoc.org/8/8b/Lab_values_3_29_14.png' /></div><div id='notes' class='noSelect WBRImgButton'><img src='http://static.wikidoc.org/e/eb/Pencil_3_29_14_trimwspace.png' /></div><div id='finish' class='noSelect WBRButton' style='background:none'><br />Finish</div></div><div id='navPane'></div><div id='examSpace'></div><span id='timeRem' style='height: 0px; visibility: hidden'>" + exam.timeAmt.toString() + "</span><div id='bottomBar'></div>");
    $("#back").click(questionNavigation);
    $("#next").click(questionNavigation);
    $("#flag").click(flagQ);
    $("#lab_vals").click(showLabs)
    $("#finish").click(endExam);
    if (window.exam.timer) {
        $("#bodyContent").append("<div style='position:absolute; z-index:1000; width:300px; height:50px; top:0px; right:0px; border: 1px solid #000; background-color:#EEE; float:right; visibility:hidden;' id='timerBox'>Testing.</div>");
        $("#timerBox").click(function() {
            window.exam.examTimer.toggle();
        });
    }
    $.each(window.exam.examQuestions, function(index, value) {
        $("#navPane").append("<div id='" + index + "' class='navPaneButton'> " + (index - -1) + "</div>");
        console.log(index)
        window.exam.examQuestions[index].creditReceived = false
    });
    $(".navPaneButton").click(questionNavigation);
    $(".navPaneButton:odd").css("background-color", "#3338CC");
    $(".navPaneButton:odd").css("background-color", "#B0B0B0");
    questionDisplay();
}

function questionDisplay() {
    var obj = new Object();
    obj = window.exam.examQuestions[window.exam.currentQuestion];
    if (obj.isParsed === 0) {
        $("#examSpace").html("<img src='http://static.wikidoc.org/5/51/Index.gif' />");
        parseQuestions();
    } else {
        var htmlStuff = "<b>Question " + (window.exam.currentQuestion - -1) + " / " + (window.exam.examQuestions.length) + "</b><br /><br />" + "<div id='highlightable'>" + obj.Prompt + "</div>" + "<br />";
        if (obj.AnswerA && obj.AnswerA.length > 0) {
            htmlStuff += "<div class='answer answerNoBorder' id='A'><input type='radio' value='A' id='Ar' name = 'question" + (window.exam.currentQuestion - -1) + "form' >" + "</div>" + "<p class='ans_text'>" + trimP(obj.AnswerA) + "</p>";
        }
        if (obj.AnswerAExp && obj.AnswerAExp.length > 0 && window.exam.examType === "Tutor") {
            htmlStuff += "<div class='answerExp explanationHide' id='Ae'>" + trimP(obj.AnswerAExp) + "</div>";
        }
        if (obj.AnswerB && obj.AnswerB.length > 0) {
            htmlStuff += "<div class='answer answerNoBorder' id='B'><input type='radio' value='B' id='Ar' name = 'question" + (window.exam.currentQuestion - -1) + "form' >" + "</div>" + "<p class='ans_text'>" + trimP(obj.AnswerB) + "</p>";
        }
        if (obj.AnswerBExp && obj.AnswerBExp.length > 0 && window.exam.examType === "Tutor") {
            htmlStuff += "<div class='answerExp explanationHide' id='Be'>" + trimP(obj.AnswerBExp) + "</div>";
        }
        if (obj.AnswerC && obj.AnswerC.length > 0) {
            htmlStuff += "<div class='answer answerNoBorder' id='C'><input type='radio' value='C' id='Ar' name = 'question" + (window.exam.currentQuestion - -1) + "form' >" + "</div>" + "<p class='ans_text'>" + trimP(obj.AnswerC) + "</p>";
        }
        if (obj.AnswerCExp && obj.AnswerCExp.length > 0 && window.exam.examType === "Tutor") {
            htmlStuff += "<div class='answerExp explanationHide' id='Ce'>" + trimP(obj.AnswerCExp) + "</div>";
        }
        if (obj.AnswerD && obj.AnswerD.length > 0) {
            htmlStuff += "<div class='answer answerNoBorder' id='D'><input type='radio' value='D' id='Ar' name = 'question" + (window.exam.currentQuestion - -1) + "form' >" + "</div>" + "<p class='ans_text'>" + trimP(obj.AnswerD) + "</p>";
        }
        if (obj.AnswerDExp && obj.AnswerDExp.length > 0 && window.exam.examType === "Tutor") {
            htmlStuff += "<div class='answerExp explanationHide' id='De'>" + trimP(obj.AnswerDExp) + "</div>";
        }
        if (obj.AnswerEExp && obj.AnswerE.length > 0) {
            htmlStuff += "<div class='answer answerNoBorder' id='E'><input type='radio' value='E' id='Ar' name = 'question" + (window.exam.currentQuestion - -1) + "form' >" + "</div>" + "<p class='ans_text'>" + trimP(obj.AnswerE) + "</p>";
        }
        if (obj.AnswerEExp && obj.AnswerEExp.length > 0 && window.exam.examType === "Tutor") {
            htmlStuff += "<div class='answerExp explanationHide' id='Ee'>" + trimP(obj.AnswerEExp) + "</div>";
        }
        $("#examSpace").html(htmlStuff);

        $("#examSpace").prepend("<div id='details' style='display:none'> <table class='tg'>  <tr>    <th class='tg-031e'>Analyte</th>    <th class='tg-031e'>Reference Range</th>  </tr>  <tr>    <td class='tg-031e'>Sodium (Na+)</td>    <td class='tg-031e'>136-145 mEq/L</td>  </tr>  <tr>    <td class='tg-031e'>Potassium (K+)</td>    <td class='tg-031e'>3.5-5.0 mEq/L</td>  </tr>  <tr>    <td class='tg-031e'>Chloride (Cl-)</td>    <td class='tg-031e'>95-105 mEq/L</td>  </tr>  <tr>    <td class='tg-031e'>Bicarbonate (HCO3-)</td>    <td class='tg-031e'>22-28 mEq/L</td>  </tr>  <tr>    <td class='tg-031e'>Magnesium (Mg2+)</td>    <td class='tg-031e'>1.5-2.0mEq/L</td>  </tr>  <tr>    <td class='tg-031e'>Calcium (Ca2+)</td>    <td class='tg-031e'></td>  </tr></table></div>");

        if (window.exam.examQuestions[window.exam.currentQuestion].selectedAnswer !== 'F') {
            $("#" + window.exam.examQuestions[window.exam.currentQuestion].selectedAnswer).addClass("boxed");
        }
        $("div.answer").mouseover(function() {
            $(this).css({
                'border': '0px solid #000'
            })
        }).mouseout(function() {
            $(this).css({
                'border': '0px solid #FFF'
            })
        });
        $("div.answer").click(answerClicked);
        $('p.ans_text').click(function() {

            $(this).toggleClass('choice_elim')
        });

        $('#highlightable').textHighlighter({
            color: '#FFFF00'
        });
    }
}

function questionReview() {
    var obj = new Object();
    obj = window.exam.examQuestions[window.exam.currentQuestion];
    if (obj.isParsed === 0) {
        $("#examSpace").html("<img src='http://static.wikidoc.org/5/51/Index.gif' />");
        parseQuestions();
    } else {
        $("#examSpace").append("<br /><a href='http://www.wikidoc.org/index.php/Talk:" + obj.PageName + "' target='_blank'>Click here to discuss this question!</a><br />");

        var htmlStuff = "<b>Author:</b> " + obj.PageAuthor + "<br /><br /><b>Question " + (window.exam.currentQuestion - -1) + " / " + (window.exam.examQuestions.length) + "</b><br /><br />" + obj.Prompt + "<br />";
        if (obj.AnswerA && obj.AnswerA.length > 0) {
            htmlStuff += "<div class='answer answerNoBorder' id='A'><input type='radio' id='Ar'>  " + obj.AnswerA + "</div></input>";
        }
        if (obj.AnswerAExp && obj.AnswerAExp.length > 0 && window.exam.examType === "Tutor") {
            htmlStuff += "<div class='answerExp explanationHide' id='Ae'><i>&nbsp;&nbsp;&nbsp;&nbsp;" + obj.AnswerAExp + "</i></div>";
        }
        if (obj.AnswerB && obj.AnswerB.length > 0) {
            htmlStuff += "<div class='answer answerNoBorder' id='B'><input type='radio' id='Br'> " + obj.AnswerB + "</input></div>";
        }
        if (obj.AnswerBExp && obj.AnswerBExp.length > 0 && window.exam.examType === "Tutor") {
            htmlStuff += "<div class='answerExp explanationHide' id='Be'><i>&nbsp;&nbsp;&nbsp;&nbsp;" + obj.AnswerBExp + "</div></i>";
        }
        if (obj.AnswerC && obj.AnswerC.length > 0) {
            htmlStuff += "<div class='answer answerNoBorder' id='C'><input type='radio' id='Cr'> " + obj.AnswerC + "</input></div>";
        }
        if (obj.AnswerCExp && obj.AnswerCExp.length > 0 && window.exam.examType === "Tutor") {
            htmlStuff += "<div class='answerExp explanationHide' id='Ce'><i>&nbsp;&nbsp;&nbsp;&nbsp;" + obj.AnswerCExp + "</i></div>";
        }
        if (obj.AnswerD && obj.AnswerD.length > 0) {
            htmlStuff += "<div class='answer answerNoBorder' id='D'><input type='radio' id='Dr'> " + obj.AnswerD + "</input></div>";
        }
        if (obj.AnswerDExp && obj.AnswerDExp.length > 0 && window.exam.examType === "Tutor") {
            htmlStuff += "<div class='answerExp explanationHide' id='De'><i>&nbsp;&nbsp;&nbsp;&nbsp;" + obj.AnswerDExp + "</i></div>";
        }
        if (obj.AnswerEExp && obj.AnswerE.length > 0) {
            htmlStuff += "<div class='answer answerNoBorder' id='E'><input type='radio' id='Er'> " + obj.AnswerE + "</input></div>";
        }
        if (obj.AnswerEExp && obj.AnswerEExp.length > 0 && window.exam.examType === "Tutor") {
            htmlStuff += "<div class='answerExp explanationHide' id='Ee'><i>&nbsp;&nbsp;&nbsp;&nbsp;" + obj.AnswerEExp + "</i></div>";
        }
        $("#examSpace").html(htmlStuff);
        addRatyRating(exam);
        if (window.exam.examQuestions[window.exam.currentQuestion].selectedAnswer && window.exam.examQuestions[window.exam.currentQuestion].RightAnswer == window.exam.examQuestions[window.exam.currentQuestion].selectedAnswer) {
            $("#" + window.exam.examQuestions[window.exam.currentQuestion].RightAnswer).addClass("boxed");
        } else {

            $("#" + window.exam.examQuestions[window.exam.currentQuestion].RightAnswer).addClass("redBoxed");
            $("#" + window.exam.examQuestions[window.exam.currentQuestion].RightAnswer).removeClass("answerNoBorder");
            $("#" + window.exam.examQuestions[window.exam.currentQuestion].selectedAnswer).addClass("boxed");
            $("#" + window.exam.examQuestions[window.exam.currentQuestion].selectedAnswer).removeClass("answerNoBorder");
        }
        $("#examSpace").append("<br /><br />The correct answer is: " + window.exam.examQuestions[window.exam.currentQuestion].RightAnswer + "<br /><br /><b>" + window.exam.examQuestions[window.exam.currentQuestion].Explanation + "</b><br /><br />");
    }
}

function addRatyRating() {
    addFirstResponses();
    var ratyLayers = "<center>Rate this question!</center><br /><span style='position:relative; float:left;'>Difficulty: <div id='star1'></div></span><span style='position:relative; float:left;left:33%;'>High Yield: <div id='star2'></div></span><span style='position:relative; float:left;left:66%'>Quality: <div id='star3'></div></span><br /><br /><br />"
    $("#examSpace").prepend(ratyLayers);

    getRating(window.exam.examQuestions[exam.currentQuestion].PageName, window.exam);

}

function addFirstResponses() {
    var api = new mw.Api();
    api.get({
        action: 'firstResponseQuery',
        question: window.exam.examQuestions[exam.currentQuestion].PageName,
        format: 'json'
    })
        .done(function(data) {
            if (data.firstResponseQuery.A === null) {
                data.firstResponseQuery.A = 0;
            }
            if (data.firstResponseQuery.B === null) {
                data.firstResponseQuery.B = 0;
            }
            if (data.firstResponseQuery.C === null) {
                data.firstResponseQuery.C = 0;
            }
            if (data.firstResponseQuery.D === null) {
                data.firstResponseQuery.D = 0;
            }
            if (data.firstResponseQuery.E === null) {
                data.firstResponseQuery.E = 0;
            }
            data.firstResponseSum = parseInt(data.firstResponseQuery.A) + parseInt(data.firstResponseQuery.B) + parseInt(data.firstResponseQuery.C) + parseInt(data.firstResponseQuery.D) + parseInt(data.firstResponseQuery.E);
            $("#Ae").append("<br />Selected as first response:" + parseInt((data.firstResponseQuery.A / data.firstResponseSum) * 100).toString() + "%");
            $("#Be").append("<br />Selected as first response:" + parseInt((data.firstResponseQuery.B / data.firstResponseSum) * 100).toString() + "%");
            $("#Ce").append("<br />Selected as first response:" + parseInt((data.firstResponseQuery.C / data.firstResponseSum) * 100).toString() + "%");
            $("#De").append("<br />Selected as first response:" + parseInt((data.firstResponseQuery.D / data.firstResponseSum) * 100).toString() + "%");
            $("#Ee").append("<br />Selected as first response:" + parseInt((data.firstResponseQuery.E / data.firstResponseSum) * 100).toString() + "%");
        });
}

function answerClicked(event) {
    $(".answer").removeClass("boxed");

    $(event.currentTarget).addClass("boxed");
    $(event.currentTarget.firstChild).prop("checked", true);
    window.exam.examQuestions[window.exam.currentQuestion].selectedAnswer = $("div .boxed").attr("id");
    if ($("#exam").find('#submit').length == 0) {
        $("#examSpace").append("<div class='noSelect WBRButton' id='submit'><br />Submit</div>");
        $("#submit").click(window.exam, answerSubmitted);
    }
}

function getRating(page, exam) {
    var api = new mw.Api();
    api.get({
        action: 'wbrgetrating',
        question: page,
        format: 'json'
    }, {
        ok: function(res) {
            $("#star1").raty({
                path: 'http://www.wikidoc.org/includes/raty/img/',
                click: function(score, event) {
                    submitRating("difficulty", score, exam.examQuestions[exam.currentQuestion].PageName)
                },
                score: res.wbrgetrating.difficulty,
                hints: ['Very Poor', 'Poor', 'Average', 'Good', 'Very Good']
            });
            $("#star1").append("(Avg: " + res.wbrgetrating.difficulty + ", n=" + res.wbrgetrating.diffCount + ")");
            $("#star2").raty({
                path: 'http://www.wikidoc.org/includes/raty/img/',
                click: function(score, event) {
                    submitRating("yield", score, exam.examQuestions[exam.currentQuestion].PageName)
                },
                score: res.wbrgetrating.yield,
                hints: ['Very Poor', 'Poor', 'Average', 'Good', 'Very Good']
            });
            $("#star2").append("(Avg: " + res.wbrgetrating.yield + ", n=" + res.wbrgetrating.qualCount + ")");
            $("#star3").raty({
                path: 'http://www.wikidoc.org/includes/raty/img/',
                click: function(score, event) {
                    submitRating("quality", score, exam.examQuestions[exam.currentQuestion].PageName)
                },
                score: res.wbrgetrating.quality,
                hints: ['Very Poor', 'Poor', 'Average', 'Good', 'Very Good']
            });
            $("#star3").append("(Avg: " + res.wbrgetrating.quality + ", n=" + res.wbrgetrating.yieldSum + ")");
        }
    });
}

function answerSubmitted(event) {
    $("#submit").remove();
    if (!window.exam.examQuestions[window.exam.currentQuestion].creditReceived && window.exam.examQuestions[window.exam.currentQuestion].selectedAnswer === String(window.exam.examQuestions[window.exam.currentQuestion].RightAnswer)) {
        console.log("You answered a question correctly")
        window.exam.answeredRight += 1;
        window.exam.examQuestions[window.exam.currentQuestion].creditReceived = true;
    }
    if (window.exam.examType === "Tutor") {
        $(".answerExp").css("height", "auto");
        $(".answerExp").css("visibility", "visible");
        $(".answerExp").each(function() {
            if ($(this).attr('id') === window.exam.examQuestions[window.exam.currentQuestion].RightAnswer + "e") {
                $(this).prepend("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>Correct:</b> ");
            } else {
                $(this).prepend("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>Incorrect:</b> ");
            }
        });

    }
    $("div.answer").unbind('click');
    var api = new mw.Api();
    api.get({
        action: 'answerQuestion',
        username: mw.user.getName(),
        question: window.exam.examQuestions[window.exam.currentQuestion].PageName,
        selected: window.exam.examQuestions[window.exam.currentQuestion].selectedAnswer,
        examid: window.exam.examid,
        format: 'json'
    })
        .done(function(data) {
            console.log('API result:', data);
        });
    if (window.exam.examType === "Exam") {
        $("#" + window.exam.examQuestions[window.exam.currentQuestion].selectedAnswer).addClass("boxed");
    } else if (window.exam.examType === "Tutor") {
        $("#examSpace").append("<br /><br />The correct answer is: " + window.exam.examQuestions[window.exam.currentQuestion].RightAnswer + "<br /><br />" + window.exam.examQuestions[window.exam.currentQuestion].Explanation + "<br />");
        $("#examSpace").append("<b>Author:</b> " + window.exam.examQuestions[window.exam.currentQuestion].PageAuthor + "<br /><br /><b>Wiki Page:</b>" + window.exam.examQuestions[window.exam.currentQuestion].PageName + "<br /><br />Discuss this question <a href='http://www.wikidoc.org/index.php/Talk:" + window.exam.examQuestions[window.exam.currentQuestion].PageName + "'>Here</a>");
        $("#" + window.exam.examQuestions[window.exam.currentQuestion].selectedAnswer).addClass("boxed");
        $("#" + window.exam.examQuestions[window.exam.currentQuestion].RightAnswer).addClass("redBoxed");
        addRatyRating(window.exam);
    }

}

function questionNavigation(event) {
    if ($(this).attr("id") === "back") {
        window.exam.currentQuestion--;
    } else if ($(this).attr("id") === "next") {
        window.exam.currentQuestion++;
    } else if ($(this).attr("class") === "navPaneButton") {
        window.exam.currentQuestion = $(this).attr("id");
    }
    questionDisplay(window.exam);
}

function questionReviewNavigation(event) {
    if ($(this).attr("id") === "back") {
        window.exam.currentQuestion--;
    } else if ($(this).attr("id") === "next") {
        window.exam.currentQuestion++;
    } else if ($(this).attr("class") === "navPaneButton") {
        window.exam.currentQuestion = $(this).attr("id");
    }
    questionReview(window.exam);
}

function flagQ(event) {
    $("#" + window.exam.currentQuestion).toggleClass("flagged");
}

function showLabs(event) {
    $("#details").stop();
    $("#details").slideToggle("slow");
}

function convolve_bernouli(qprobs) {
    //takes in an array of probabilities of guessing questions correct
    for (var counter = 0; counter < qprobs.length; counter++) {
        //if the loop is in the first iteration, then initialize the array
        if (counter == 0) {
            var pdfArray = [1 - qprobs[0], qprobs[0]];
        } else {
            //initialize new Array for pdfs
            var newpdfArray = [];
            for (var i = 0; i < pdfArray.length + 1; i += 1) {
                newpdfArray[i] = 0;
            }
            //multiply by ones first
            for (var i = 0; i < pdfArray.length; i += 1) {
                newpdfArray[i + 1] += pdfArray[i] * qprobs[counter]; //probability of adding a success
                newpdfArray[i] += pdfArray[i] * (1 - qprobs[counter]);
            }

            pdfArray = newpdfArray;
        }

    }
    console.log(pdfArray);
    return (pdfArray);
} //ends convolve_bernouli

function endExam(event) {
    if (window.exam.timer) {
        $('#timerBox').html("");
        $('#timerBox').css("visibility", "hidden");
        window.exam.examTimer.stop();
    }
    $("#examSpace").html("");
    var datas;
    datas = "";
    datas += "<br />You answered " + window.exam.answeredRight + " out of " + window.exam.examQuestions.length + " correctly.<br /> Your percentage score is: ";
    var percent = Math.round((window.exam.answeredRight / window.exam.examQuestions.length) * 100);
    testlength = window.exam.examQuestions.length;
    var question_probs = [];
    for (var j = 0; j < testlength; j += 1) {
        question_probs[j] = Math.random();
    }
    qdist = convolve_bernouli(question_probs);

    var myTotal = 0; //Variable to hold your total

    for (var i = 0, len = window.exam.answeredRight + 1; i < len; i++) {
        myTotal += qdist[i]; //Iterate over your first array and then grab the second element add the values up
    }


    datas += percent + "%<br /><br />Click the Navigation Buttons on the left to review the questions you answered.<br />";
    datas += "<br />You scored in the " + Math.round(myTotal * 100) + " percentile. <br /><br />";

    datas += "<canvas id='simExams' width='600' height='400'></canvas>";


    var api = new mw.Api();

    api.get({
        action: 'endExam',
        id: window.exam.examid,
        score: percent,
        format: 'json'
    })
        .done(function(data) {
            console.log('API result:', data);
        });

    $("#examSpace").append(datas);
    $(".navPaneButton").unbind('click');
    $(".navPaneButton").click(window.exam, questionReviewNavigation);
    point_labels = [];
    for (var j = 0; j < qdist.length; j += 1) {
        point_labels[j] = j.toString();
    }


    var simExamData = {
        labels: point_labels,
        datasets: [{
            fillColor: "rgba(220,220,220,0.5)",
            strokeColor: "rgba(220,220,220,1)",
            pointColor: "rgba(220,220,220,1)",
            pointStrokeColor: "#fff",
            data: qdist,
            title: "Percent of test takers"
        }]
    }

    var newopts = {
        yAxisLabel: "Percent of test takers",
        yAxisFontFamily: "'Arial'",
        yAxisFontSize: 16,
        yAxisFontStyle: "normal",
        yAxisFontColor: "#666",
        xAxisLabel: "Number of correct answers",

        legend: false,
        legendFontFamily: "'Arial'",
        legendFontSize: 12,
        legendFontStyle: "normal",
        legendFontColor: "#666",
        legendBlockSize: 15,
        legendBorders: false,
        legendBordersColor: "#666",


        graphTitle: "Peer Performance",
        graphTitleFontFamily: "'Arial'",
        graphTitleFontSize: 24,
        graphTitleFontStyle: "bold",
        graphTitleFontColor: "#666",
    }

    // get line chart canvas
    var simExams = document.getElementById('simExams').getContext('2d');
    // draw line chart
    new Chart(simExams).Line(simExamData, newopts);
}


function submitRating(ratingType, score, page) {
    if (ratingType === "difficulty") {
        var api = new mw.Api();
        api.get({
            action: 'wbrinsertrating',
            username: mw.user.getName(),
            question: page,
            difficulty: score,
            format: 'json'
        }, {
            ok: function(res) {}
        });
    } else if (ratingType === "yield") {
        var api = new mw.Api();
        api.get({
            action: 'wbrinsertrating',
            username: mw.user.getName(),
            question: page,
            yield: score,
            format: 'json'
        }, {
            ok: function(res) {}
        });
    } else if (ratingType === "quality") {
        var api = new mw.Api();
        api.get({
            action: 'wbrinsertrating',
            username: mw.user.getName(),
            question: page,
            quality: score,
            format: 'json'
        }, {
            ok: function(res) {}
        });
    }
}

function parseQuestions(examObj) {
    var tobeParsed = null;
    var parsed = null;
    var q = examObj.currentQuestion;
    switch (examObj.examQuestions[q].lastParsed) {
        case 0:
            tobeParsed = examObj.examQuestions[q].Prompt;
            break;
        case 1:
            tobeParsed = "A. " + examObj.examQuestions[q].AnswerA;
            break;
        case 2:
            tobeParsed = "B. " + examObj.examQuestions[q].AnswerB;
            break;
        case 3:
            tobeParsed = "C. " + examObj.examQuestions[q].AnswerC;
            break;
        case 4:
            tobeParsed = "D. " + examObj.examQuestions[q].AnswerD;
            break;
        case 5:
            tobeParsed = "E. " + examObj.examQuestions[q].AnswerE;
            break;
        case 6:
            tobeParsed = examObj.examQuestions[q].Explanation;
            break;
        case 7:
            tobeParsed = examObj.examQuestions[q].AnswerAExp;
            break;
        case 8:
            tobeParsed = examObj.examQuestions[q].AnswerBExp;
            break;
        case 9:
            tobeParsed = examObj.examQuestions[q].AnswerCExp;
            break;
        case 10:
            tobeParsed = examObj.examQuestions[q].AnswerDExp;
            break;
        case 11:
            tobeParsed = examObj.examQuestions[q].AnswerEExp;
            break;
        case 12:
            tobeParsed = examObj.examQuestions[q].Author
    }
    if (tobeParsed && tobeParsed.length > 0) {
        var api = new mw.Api();
        api.get({
            action: 'parse',
            text: tobeParsed,
            disablepp: 'disablepp',
            format: 'json'
        }, {
            ok: function(html) {
                parsed = html.parse.text['*'];

                switch (examObj.examQuestions[q].lastParsed) {
                    case 0:
                        examObj.examQuestions[q].Prompt = parsed;
                        break;
                    case 1:
                        examObj.examQuestions[q].AnswerA = parsed;
                        break;
                    case 2:
                        examObj.examQuestions[q].AnswerB = parsed;
                        break;
                    case 3:
                        examObj.examQuestions[q].AnswerC = parsed;
                        break;
                    case 4:
                        examObj.examQuestions[q].AnswerD = parsed;
                        break;
                    case 5:
                        examObj.examQuestions[q].AnswerE = parsed;
                        break;
                    case 6:
                        examObj.examQuestions[q].Explanation = parsed;
                        break;
                    case 7:
                        examObj.examQuestions[q].AnswerAExp = parsed;
                        break;
                    case 8:
                        examObj.examQuestions[q].AnswerBExp = parsed;
                        break;
                    case 9:
                        examObj.examQuestions[q].AnswerCExp = parsed;
                        break;
                    case 10:
                        examObj.examQuestions[q].AnswerDExp = parsed;
                        break;
                    case 11:
                        examObj.examQuestions[q].AnswerEExp = parsed;
                        break;
                    case 12:
                        examObj.examQuestions[q].Author = parsed;
                        break
                }
                if (examObj.examQuestions[q].lastParsed < 13) {
                    examObj.examQuestions[q].lastParsed += 1;
                    parseQuestions(examObj);
                } else {
                    examObj.examQuestions[q].isParsed = 1;
                    questionDisplay(examObj);
                }
            }
        });
    } else {
        if (examObj.examQuestions[q].lastParsed < 12) {
            examObj.examQuestions[q].lastParsed += 1;
            parseQuestions(examObj);
        } else {
            examObj.examQuestions[q].isParsed = 1;
            questionDisplay(examObj);
        }
    }
}

function countCats() {
    console.log('Running countCats')
    var temp = window.exam.examtype.replace(/ /g, "_");
    var api = new mw.Api();
    api.get({
        action: 'singlecat',
        exam: temp,
        format: 'json',
        async: false
    }, {
        ok: function(data) {
            window.exam.arrCounts = data;
            selectCats(window.exam);
        }
    });
}
// Common functions
function pad(number, length) {
    var str = '' + number;
    while (str.length < length) {
        str = '0' + str;
    }
    return str;
}

function formatTime(time) {
    var min = parseInt(time / 6000),
        sec = parseInt(time / 100) - (min * 60),
        hundredths = pad(time - (sec * 100) - (min * 6000), 2);
    return (min > 0 ? pad(min, 2) : "00") + ":" + pad(sec, 2);
}

function urlSwapSpace(swap) {
    return swap.split(' ').join('+');
}

function trimP(data) {
    return data.substring(3, data.length - 4).trim();;
}
function initiliazeDOM() {
    
    $("#testOptions").hide();
    $("#exam").hide();
    $("#footer").hide();
    $("#mw-head").hide();
    $("#mw-head-base").hide();
    $("#mw-page-base").hide();
    $("#searchbox").hide();
    //$("#firstHeading").after("<div class='show_wiki_button' style='font-family: Lato, Calibri, Arial, sans-serif; color:#aaa;font-size:0.5em;'>Wikiview</div>");
    $("#firstHeading").hide();
    $("#wikidocNav").hide();
    $("#contentSub").hide();
    $("div:contains('twitter'):last").hide() //hides the twitter bar at the bottom that gets in the way of other elements
    $("hr").hide()


    $(".show_wiki_button").click(function() {
        $("#footer").show();
        $("#mw-head").show();
        $("#mw-head-base").show();
        $("#mw-page-base").show();
        $("#searchbox").show();
        $("#firstHeading").show();
        $("#wikidocNav").show();
        $("#contentSub").hide()
    })
}