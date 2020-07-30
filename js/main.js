var SOCKET_ADDRESS = "//csgopolygon.com/";
if (window.location.hostname == 'csgopolygon.gg') {
    SOCKET_ADDRESS = "//csgopolygon.gg";
}
var UNAME = "";
var RANK = 0;
var n = 0;
var ROUND = 0;
var CASEW = 1380;
var ROOM = LANG_SELECT == 'en' ? 'EN' : 'RU';
var od;
var od_m;
var snapX = 0;
var IGNORE              = [];
var R = .999;
var S = .01;
var tf = 0;
var vi = 0;
var animStart = 0;
var isMoving = false;
var LOGR = Math.log(R);
var SHOWBETS = true;
var MAX_BET = 5000000;
var MODE = 'roulette';

var crash_bet = false;
var crash_amount = 0;
var crash_next_bet = false;
var crash_next_amount = 0;
var crash_next_cashout = 0;
var crash_pre_point = 1;
var crash_current_point = 1;
var crash_start_time = 0;
var crash_tr = 0;
var crash_game_status = 0;
var crash_auto_cashout = 0;
var crash_connected = 0;
var c_crashed = 0;

var coinflip_connected = 0;
if (window.location.hostname == 'csgopolygon.gg') {
    SOCKET_ADDRESS = "//csgopolygon.gg";
}
var SOCKET = null;
$CASE = null;
$BANNER = null;

SOUND_ENABLE = true;
var sounds_rolling      = new Audio("sounds/rolling.wav");
var sounds_tone         = new Audio("sounds/tone.wav");
    sounds_rolling.volume   = .5;
    sounds_tone.volume      = .5;

    function play_sound(data) {
        
        if(!$('.sound').hasClass('off') && SOUND_ENABLE) {
            
            if(data == 'roll') sounds_rolling.play();
            else if(data == 'finish') sounds_tone.play();
            
        }
    
    }

function send(event, object) {

    if (SOCKET) SOCKET.emit(event, object);

}

String.prototype.format = function() {
    var a = this;
    for (var k in arguments) {
        a = a.replace(new RegExp("\\{" + k + "\\}", 'g'), arguments[k]);
    }
    return a
}


function snapRender(t, e) {




    CASEW = $CASE.width();
    var CASEH = $CASE.height();
    var case_x = CASEH / 92;
    var case_w = ((1380 * case_x) / 30);

    if (!isMoving) {

        if (t == undefined) view(snapX);
        else {

            for (var a = [1, 14, 2, 13, 3, 12, 4, 0, 11, 5, 10, 6, 9, 7, 8], n = 0, i = 0; i < a.length; i++) {

                if (t == a[i]) {

                    n = i;

                    break;

                }

            }

            //var c = case_w * 2 * n + (case_w * 2 * t.wobble); 
             var c = case_w * 2 * n + (case_w); 
            c += (6900 * case_x);
            snapX = c;

            view(snapX);

        }

    }

}

function view(t) {
    
    var CASEH = $CASE.height();
    var case_x = CASEH / 92;
    t = -((t + (1380 * case_x) - CASEW / 2) % (1380 * case_x));

    $CASE.css("background-position", t + "px 0px");

}

function __SOCKET_EVENT_ERROR_APP(data) {

    if (data.enable) $('.betButton').prop('disabled', false);
    if (data.dice_enable) $('#dice_play').prop('disabled', false);

    chat('error', data.error);

}


function __SOCKET_EVENT_ALERT(data) {

    if (data.maxbet) MAX_BET = data.maxbet;

    if (!isNaN(data.balance)) updateBalance(data.balance, false);

    chat("alert", data.alert);

}

function __SOCKET_EVENT_BALANCE(data) {

    updateBalance(data.balance, true);

}

function __SOCKET_EVENT_REMOVE_MSG(data) {
    
    $(document).find('#' + data.unique_id).find('.message_text ').html(LNG.MESSAGE_DELETE + " (" + data.owner + ")")
        
}

function connect() {

    if (SOCKET) console.log(LNG.ALREADY_CONNECTED);
    else {

        $(".messages").last().html('');
        chat('log', LNG.GENERATE_TOKEN);

        $.ajax({
            'url': "/scripts/getToken.php?v=" + (new Date()).getTime(),
            success: function(data) {

                if (data) {


                    if (data == 'max') chat('log', LNG.FULL_LOAD);
                    else {

                        chat('log', LNG.SERVER_CONNECT);

                        SOCKET = io.connect(SOCKET_ADDRESS, {
                            'query': data + "&language=" + LANG_SELECT,
                            'reconnection': false
                        });

                        SOCKET.on('connect', function() {

                            if(getCookie('mode') == 'crash') crash_connect(); 

                            $(".messages").last().html('');
                            if (data == 'nologin') chat('log', LNG.AUTHORIZATION_STEAM);
                            SOCKET.on('chat', function(data) {
                               
                                __SOCKET_EVENT_CHAT(data)
                            });
                            SOCKET.on('hello', function(data) {
                                __SOCKET_EVENT_HELLO(data);
                            });
                            SOCKET.on('roll', function(data) {
                                __SOCKET_EVENT_ROLL(data)
                            });
                            SOCKET.on('roulette_jackpot', function(data) {
                                __SOCKET_EVENT_ROULETTE_JACKPOT(data)
                            });
                            SOCKET.on('bet', function(data) {
                                __SOCKET_EVENT_BET(data)
                            });
                            SOCKET.on('bet_confirm', function(data) {
                                __SOCKET_EVENT_BET_CONFIRM(data)
                            });
                            SOCKET.on('logins', function(data) {
                                __SOCKET_EVENT_LOGINS(data)
                            });
                            SOCKET.on('error_app', function(data) {
                                __SOCKET_EVENT_ERROR_APP(data)
                            });
                            SOCKET.on('alert', function(data) {
                                __SOCKET_EVENT_ALERT(data)
                            });
                            SOCKET.on('balance', function(data) {
                                __SOCKET_EVENT_BALANCE(data)
                            });
                            SOCKET.on('dice_game', function(data) {
                                __SOCKET_EVENT_DICE_GAME(data)
                            });
                            SOCKET.on('dice_roll', function(data) {
                                __SOCKET_EVENT_DICE_ROLL(data)
                            });
                            SOCKET.on('hello_crash', function(data) {
                                __SOCKET_EVENT_CRASH_HELLO(data)
                            });
                           SOCKET.on('remove_msg',     function(data) { __SOCKET_EVENT_REMOVE_MSG(data) });
                              
                 

                        });

                        SOCKET.on('connect_error', function() {

                            chat('error', LNG.ERROR_CONNECTION_CLOSED);

                        });

                        SOCKET.on('connect_timeout', function() {

                            chat('error', LNG.ERROR_CONNECTION_CLOSED);

                        });

                        SOCKET.on('disconnect', function(error) {

                            chat('error', LNG.CONNECTION_ABORT + ' (' + error + ')');

                        });

                    }

                } else chat('log', LNG.ERROR_NO_TOKEN);


            },
            error: function() {

                chat('log', LNG.ERROR_NO_TOKEN);


            }
        });

    }

}

jQuery.fn.extend({
    countTo: function(t, e) {
        e = e || {};
        var a = "",
            n = $("#settings_dongers").is(":checked");
        var i = $(this),
            s = parseFloat(i.html()),
            o = t - s;
        e.color && (o > 0 ? i.addClass("text-success") : 0 > o && i.addClass("text-danger"));
        var l = "";
        e.keep && o > 0 && (l = "+");
        var c = o;
        n && (c *= 1e3);
        var r = Math.min(400, Math.round(Math.abs(c) / 500 * 400));
        $({
            count: s
        }).animate({
            count: t
        }, {
            duration: r,
            step: function(t) {
                var e = 0;
                e = n ? t.toFixed(3) : Math.floor(t), i.html("" + l + e)
            },
            complete: function() {
                e.keep || i.removeClass("text-success text-danger"), e.callback && e.callback()
            }
        })
    },
    countTo1: function(t, e) {
        e = e || {};
        var a = "",
            n = false;
        var i = $(this),
            s = parseFloat(i.html()),
            o = t - s;
        e.color && (o > 0 ? i.addClass("text-success") : 0 > o && i.addClass("text-danger"));
        var l = "";
        e.keep && o > 0 && (l = "+");
        var c = o;
        n && (c *= 1e3);
        var r = Math.min(400, Math.round(Math.abs(c) / 500 * 400));
        $({
            count: s
        }).animate({
            count: t
        }, {
            duration: r,
            step: function(t) {
                var e = 0;
                e = n ? t.toFixed(3) : Math.floor(t), i.html("" + l + e)
            },
            complete: function() {
                e.keep || i.removeClass("text-success text-danger"), e.callback && e.callback()
            }
        })
    }
}), $(document).ready(function() {



    $CASE = $(".rolling > .roulette");
    $BANNER = $(".progress_timer");
    $("#message_text").keyup(function(e){
    
        if(e.keyCode == 13) send_message();
    });
    // Dice game settings
    $('.dice_number').ionRangeSlider({
        type: "double",
        min: 0,
        max: 100,
        from: 50,
        to: 100,
        from_min: 1.99,
        from_max: 100,
        to_min: 1.99,
        to_max: 100,
        min_interval: 1,
        step: 0.01,
        onStart: function(data) {
            dice_number_from = data.from;
            dice_number_to = data.to;
            dice_calculate();
        },
        onChange: function(data) {
            dice_number_from = data.from;
            dice_number_to = data.to;
            dice_calculate();
        },
    });
    dice_calculate();
    connect();
    changeMode(getCookie('mode'));
});

var dice_number_from = 50;
var dice_number_to = 100;

function dice_calculate() {
    var win_chance = (dice_number_to - dice_number_from).toFixed(2);
    var factor = (99 / win_chance).toFixed(4);
    var bet_amount = $('#dice_amount').val();
    if(getCookie("settings_dongers") == 'true') {
        var profit = parseFloat((bet_amount * factor).toFixed(4));
    } else {
        var profit = parseInt(bet_amount * factor);
    }
    

    $('#dice_payout').text(factor);
    $('#dice_win_chance').text(win_chance);
    $('#dice_profit').val(profit)
}


function __SOCKET_EVENT_CHAT(data) {
   
    chat('player', data.msg, data.time, data.prefix, data.rank, data.icon, data.name, data.steamid, data.user, data.hide, data.prefix_color, data.name_color, data.link, data.unique_id, data.reply, data.reply_uid);

}

function spin(t) {

    CASEW = $CASE.width();
    var e = t.roll;
    var CASEH = $CASE.height();
    var case_x = CASEH / 92;
    var case_w = ((1380 * case_x) / 30);

    for (var a = [1, 14, 2, 13, 3, 12, 4, 0, 11, 5, 10, 6, 9, 7, 8], n = 0, i = 0; i < a.length; i++) {

        if (e == a[i]) {

            n = i;
            break;

        }

    }

    //var c = case_w * 2 * n + (case_w * 2 * t.wobble); 
    var c = case_w * 2 * n + (case_w); 

    console.log('CASEH', CASEH, 'CASEW', CASEW, 'CASE_X', case_x, 'CASE_W', case_w, 'C', c, 'wobble', t.wobble);

    c += (6900 * case_x);



    animStart = (new Date).getTime();

    vi = getVi(c);
    tf = getTf(vi);

    isMoving = true;

    setTimeout(function() {

        finishRoll(t, tf);

    }, tf);

    render();

}

function finishRoll(t, e) {
    if(getCookie("settings_dongers") == 'true') {
        t.won = parseFloat((t.won / 1000).toFixed(4));
    }
    $BANNER.html(LNG.ROLL_NUMBER + t.roll + "!"), addHist(t.roll, t.rollid);
    play_sound("finish");
    for (var a = 0; a < 3; a++) {
        if(getCookie("settings_dongers") == 'true') {
            t.nets[a].amount = parseFloat((t.nets[a].amount / 1000).toFixed(2));
            t.nets[a].jackpot = parseFloat((t.nets[a].jackpot / 1000).toFixed(2));
            t.nets[a].swon = parseFloat((t.nets[a].swon / 1000).toFixed(2));
        }
        if (t.jackpot) $("#panel" + t.nets[a].lower + "-" + t.nets[a].upper + "-t").find(".total").addClass('jackpot_count');
        var p = parseFloat(t.nets[a].swon) + parseFloat(t.nets[a].jackpot);
        $("#panel" + t.nets[a].lower + "-" + t.nets[a].upper + "-t").find(".total").countTo(p > 0 ? p : -t.nets[a].amount, {
            color: !0,
            keep: !0
        });

    }
    for (var n = [
            [0, 0],
            [1, 7],
            [8, 14]
        ], a = 0; a < n.length; a++) {
        var i = $("#panel" + n[a][0] + "-" + n[a][1] + "-m").find(".mytotal");
        if (t.jackpot) i.addClass('jackpot_count');
        if (t.roll >= n[a][0] && t.roll <= n[a][1])
            i.countTo(t.won, {
                color: !0,
                keep: !0
            });
        else {
            var s = parseFloat(i.html());
            i.countTo(-s, {
                color: !0,
                keep: !0
            })
        }
    }
    null != t.balance && updateBalance(t.balance, false), setTimeout(function() {
        cd(t.count),
            $(".total,.mytotal,.totalCount").removeClass("text-success text-danger").html(0), $(".round_players li").remove(), snapRender(), $(".betButton").prop("disabled", !1), SHOWBETS = !0;
        for (var a = 0; a < 3; a++) {
            $("#panel" + t.nets[a].lower + "-" + t.nets[a].upper + "-t").find(".total").removeClass('jackpot_count');
        }
        for (var n = [
                [0, 0],
                [1, 7],
                [8, 14]
            ], a = 0; a < n.length; a++) {
            var i = $("#panel" + n[a][0] + "-" + n[a][1] + "-m").find(".mytotal");
            i.removeClass('jackpot_count')
        }
    }, 1e3 * t.wait - e)
}

function d_mod(t, e) {

    return t * (Math.pow(R, e) - 1) / LOGR;

}

function getTf(t) {

    return (Math.log(S) - Math.log(t)) / LOGR;

}

function getVi(t) {

    return S - t * LOGR;

}

function v(t, e) {

    return t * Math.pow(R, e);

}

function render() {

    var t = (new Date).getTime() - animStart;

    if (t > tf) t = tf;

    var e = d_mod(vi, t);

    view(e);

    if (tf > t) requestAnimationFrame(render);
    else {

        snapX = e;

        isMoving = false;

    }

}

function crash_disconnect() {

    if(SOCKET != null) {
    crash_connected = 0;
    SOCKET.off('crash_bet');
    SOCKET.off('crash_user_cashout');
    SOCKET.off('crash_cashout');
    SOCKET.off('crash_place_bet');
    SOCKET.off('crash_timer');
    SOCKET.off('crash_slider')
    SOCKET.off('crash_new');
    SOCKET.off('crash_end');
    }


}

function crash_connect() {

    if(SOCKET) SOCKET.emit('crash_get');


}

$(document).on('click', '.coinflip_sort_click', function() {

    var sort = $(this).attr('sort');
    if(sort == 'high') {
        $(this).html('Lowest amount first');
        $(this).attr('sort', 'low');
    } else {
        $(this).html('Highest amount first');
        $(this).attr('sort', 'high');
    }

    try {
       $('#coinflip_allgames > .coinflip_unit').tsort({
          attr:'data-amount',
         order: ($('.coinflip_sort_click').attr('sort') == 'high' ? 'desc' : 'asc')
       });
    } catch (a) {}

});

$(document).on('change', '#cf_showcount', function() {
    calculate_coinflip();
})

$(document).on('keyup', '#cf_min', function() {
    calculate_coinflip();
})

$(document).on('keyup', '#cf_max', function() {
    calculate_coinflip();
})


function calculate_coinflip() {


    $('#coinflip_count_my').html($('#coinflip_mygames > .coinflip_unit').length);
    $('#coinflip_count_all').html($('#coinflip_allgames > .coinflip_unit').length);

    var min = parseInt($('#cf_min').val());
    var max = parseInt($('#cf_max').val());

    var c = 0;
    $('#coinflip_allgames > .coinflip_unit').each(function() {
        if(c > $('#cf_showcount').val()) $(this).hide();
        else {
            if(!(min == 0 && max == 0)) {

                var amount = $(this).data('amount');
                if(amount < min || amount > max) {
                    $(this).hide();
                } else $(this).show();

            } else {
                $(this).show();
            }
        }
        c++;
    });
}

function coinflip_connect() {
    coinflip_connected = 1;
    $.ajax({
        url : '/scripts/coinflip/games.php',
        type : 'get',
        success : data => {
            data = JSON.parse(data);
            if(data.success) {
                
                for(var i = 0; i < data.games.length; i++) {
                    var game = data.games[i];
                    add_coinflip(game);
                }
                    SOCKET.on('coinflip_create', function(data) {
                        __SOCKET_EVENT_COINFLIP_CREATE(data)
                    });
                    SOCKET.on('coinflip_join', function(data) {
                        __SOCKET_EVENT_COINFLIP_JOIN(data)
                    });
                    SOCKET.on('coinflip_cancel', function(data) {
                        __SOCKET_EVENT_COINFLIP_CANCEL(data)
                    });

            } else {
                coinflip_connected = 0;
                chat('error', data.error);
            }
        },
        error : err => {
            coinflip_connected = 0;
            console.log('New error');
            console.log(err.responseText);
        }
    });

}

function setCrash(gf, gt, sp, pr, sf, st, onComplete) {
    if (st) $('.crash-info').CountUp('stop');
    //$('.crash-info').CountUp({from: gf,to: gt,speed: sp,refreshInterval: 50,decimals: 2,formatter: function (value, options) {return pr + value.toFixed(2) + sf;},onComplete: onComplete});
    $('.crash-info').text('x' + (gt).toFixed(2));
    onComplete();
}

function growthFunc(ms) {
    var r = 0.00006;
    return Math.floor(100 * Math.pow(Math.E, r * ms));
}

function ct(e, at, o, label, data, color) {
    var tt = Date.now();
    label.push(label[label.length - 1] + 1);
    data.push(at / 100);
    __SOCKET_EVENT_CRASH_SLIDER({
        data: data,
        label: label,
        x: at,
        crashed: false,
        color: color,
        t: tt,
        o: o
    });
}

function rt(o, label, data, color) {
    var o = o + 150;
    // console.log("RTO", o)
    var at = growthFunc(o);

    ct(o, at, o, label, data, color);;
}

const change_c = (point, res) => {
    setTimeout(function() {
        if (point == crash_current_point) {
        
            rt(res.o, res.label, res.data, res.color)
        }
    }, 155)
}


const __SOCKET_EVENT_CRASH_SLIDER = (res) => {
    //console.log('RES', res)
    
    if(window != undefined && window.myLine != undefined) {
        window.myLine.data.labels = res.label;
        window.myLine.data.datasets[0].data = res.data;
        window.myLine.options.scales.yAxes[0].ticks.max = Math.max.apply(2, res.data) + 1;
        window.myLine.update();
    }


    var o = res.o;
    var tt = res.t;

    crash_pre_point = crash_current_point;
    crash_current_point = res.x / 100;

    if (!res.crashed) {
        if (crash_current_point < res.x && c_crashed == 0 && crash_connected == 1) {
            $('.crash-info').text(((res.crashed) ? 'CRASHED ' : '') + 'x' + (res.x / 100).toFixed(2));
            change_c(crash_current_point, res);
        }
    } else {
        c_crashed = 1;
        $('.crash-info').text(((res.crashed) ? 'CRASHED ' : '') + 'x' + (res.x / 100).toFixed(2));
    }


    if (res.crashed) {
        if(window != undefined && window.myLine != undefined) {
            window.myLine.data.datasets[0].backgroundColor = gradientStrokeLose;
            window.myLine.data.datasets[0].borderColor = '#E1675A';
            window.myLine.update();
        }
        $('.crash-info').css({
            'transition': 'color 200ms ease',
            'color': '#a74c5c'
        });
        //$('.btn-withdraw span').text('Вывести');
    } else {
        if (crash_bet) {
            if(getCookie("settings_dongers") == 'true') {
                var cashout = parseFloat((crash_amount * res.x / 100).toFixed(4));
            } else {
                var cashout = parseInt(crash_amount * res.x / 100);
            }
            $('.crash-button-bet').html(LNG.CRASH_CASHOUT + ' (' + cashout + ')');
        }
        $('.crash-info').css({
            'transition': 'color 200ms ease',
            'color': res.color
        });
    }
}

const resetPlot = () => {
    if(window != undefined && window.myLine != undefined) {
        window.myLine.data.labels = [0];
        window.myLine.data.datasets[0].data = [0];
        window.myLine.options.scales.yAxes[0].ticks.max = 2;
        window.myLine.data.datasets[0].backgroundColor = gradientStroke;
        window.myLine.data.datasets[0].borderColor = 'rgb(94, 183, 110)';
        window.myLine.update();
    }
}
const __SOCKET_EVENT_CRASH_NEW = (data) => {


    crash_bet = false;
    crash_amount = 0;
    crash_pre_point = 1;
    crash_current_point = 1;
    $('#crash-game-id').text(data.id);
    $('#crash-game-hash').text(data.hash);
    $('#crash-game-seed').text('hidden');
    $('.crash-button-bet').html(LNG.CRASH_PLACE_BET);
    $('.crash_user_tr').remove();
    if (crash_next_bet == 1) {
        crash_bet_req(crash_next_amount, $('.on_off').hasClass('toggled') ? 0 : 1, crash_next_cashout);
    }
    $('.crash-info').css('color', '#c1c1c1').text('Loading..');
    resetPlot();

}
const __SOCKET_EVENT_CRASH_END = (data) => {

    c_crashed = 1;
    data.x = data.x / 100;
    $('#crash-game-seed').text(data.seed);
    $('.crash-user').each(function(i, elem) {
        if (!$(this).hasClass("crash-win")) {
            var id = $(this).attr('crashid');
            var bet = $(this).find('span#crash_amount').text();
     
            $('[crashid=' + id + ']').addClass('crash-lose');
            $('[crashid=' + id + ']').find($('span#crash_profit')).text('-' + bet).addClass('lose');
        }
    });

    //try {tinysort(".crash-users > tbody > tr", {data: "status",order: "desc"})} catch (a) {}


    var hClass = 'red_label';

    if (data.x == 1) hClass = 'dark_label'
    if (data.x >= 1.5) hClass = 'gray_label';
    if (data.x >= 2) hClass = 'aqua_label';
    if (data.x >= 4) hClass = 'green_label';

    if ($(".crash-history > li").length > 9) $(".crash-history > li").last().remove();
    $(".crash-history").prepend("<li data-hash='" + data.hash + "' data-id='" + data.gid + "' data-seed='" + data.seed + "'><span class='" + hClass + "'>" + data.x + "</span></li>");

}
const __SOCKET_EVENT_CRASH_TIMER = (data) => {

    c_crashed = 0;
    $('.crash-info').text('Next round in ' + data.value + ' s..');

}

    function __SOCKET_EVENT_CRASH_BET(data) {
        //return;

        if(getCookie("settings_dongers") == 'true') {
            data.amount = parseFloat((data.amount / 1000).toFixed(4))
        }
       
        var crash_bet_tmp = '<tr crashid="{3}" class="crash-user crash_user_tr" data-amount="{2}" data-status="0">';
            crash_bet_tmp += '<td><span data-type="responsive">Game</span><a href="{4}" target="_blank" class="table_user"><img src="{0}" alt="{1}" class="contextmenu" steamid="{5}" uid="{6}" name="{1}""><span>{1}</span></a></td>';
            crash_bet_tmp += '<td><span data-type="responsive">Coeff</span><span id="crash_point">-</span></td>';
            crash_bet_tmp += '<td><span data-type="responsive">Bet</span><span id="crash_amount">{2}</span></td>';
            crash_bet_tmp += '<td><span data-type="responsive">Profit</span><span id="crash_profit" class="profit">-</span></td>';
            crash_bet_tmp += '</tr>';

        var avatar = 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars' + data.avatar;
        var link = '#';
        if(data.steamid != 0) link = 'https://steamcommunity.com/profiles/' + data.steamid;
        var crash_bet = crash_bet_tmp.format(avatar, data.username, data.amount, data.id, link, data.steamid, data.uid);

        $('.crash_bets_table').after($(crash_bet));
       
        try { tinysort('.crash_user_tr',     {'data': 'amount', 'order': 'desc'}); } catch (a) { }
     

        
    }

    function __SOCKET_EVENT_CRASH_USER_CASHOUT(data) {
       // return;
        crash_bet = false;
        crash_amount = 0;
        $('.crash-button-bet').html(LNG.CRASH_PLACE_BET);
        updateBalance(data.balance, true);

    }

    function __SOCKET_EVENT_CRASH_CASHOUT(data) {
        //return;
        if(getCookie("settings_dongers") == 'true') {
            data.profit = parseFloat((data.profit / 1000).toFixed(2));
        }

        $('[crashid=' + data.id + ']').addClass('crash-win')
        $('[crashid=' + data.id + ']').attr('data-status', 1);
        $('[crashid=' + data.id + ']').find($('span#crash_point')).text('x' + (data.point / 100));
        $('[crashid=' + data.id + ']').find($('span#crash_profit')).text('+' + data.profit).addClass('win');

    }    

function __SOCKET_EVENT_CRASH_HELLO(data) {
    
    resetPlot();
    SOCKET.on('crash_bet',          function(data) { __SOCKET_EVENT_CRASH_BET(data) });
    SOCKET.on('crash_user_cashout', function(data) { __SOCKET_EVENT_CRASH_USER_CASHOUT(data) });
    SOCKET.on('crash_cashout',      function(data) { __SOCKET_EVENT_CRASH_CASHOUT(data) });
    SOCKET.on('crash_timer', function(data) {
        __SOCKET_EVENT_CRASH_TIMER(data);
    });
    SOCKET.on('crash_slider', function(data) {
        __SOCKET_EVENT_CRASH_SLIDER(data);
    })
    SOCKET.on('crash_new', function(data) {
        __SOCKET_EVENT_CRASH_NEW(data)
    });
    SOCKET.on('crash_end', function(data) {
        __SOCKET_EVENT_CRASH_END(data)
    });
    $('.crash-history').html('');
    $('.crash_user_tr').remove();
    if (data.crashes) {
        for (var i = 0; i < data.crashes.length; i++) {
            var hClass = 'red_label';
            var point = (data.crashes[i].crash / 100);
            if (point == 1) hClass = 'dark_label'
            if (point >= 1.5) hClass = 'gray_label';
            if (point >= 2) hClass = 'aqua_label';
            if (point >= 4) hClass = 'green_label';
            $('.crash-history').append("<li data-hash='" + data.crashes[i].hash + "' data-id='" + data.crashes[i].id + "' data-seed='" + data.crashes[i].seed + "'><span class='" + hClass + "'>" + point + "</span></li>");

        }
    }
    $('#crash-game-id').text(data.gid);
    $('#crash-game-hash').text(data.hash);
    if (data.status == 2) {
        $('.crash-info').css('color', '#c1c1c1').text('Loading..');
    }
    if (data.active_bet) {

        if(getCookie("settings_dongers") == 'true') {
                data.active_bet.amount = parseFloat((data.active_bet.amount / 1000).toFixed(2));
        }

        crash_bet = 1
        crash_amount = data.active_bet.amount;
        $('.crash-button-bet').addClass('bet_placed');
        $('.crash-button-bet').html(LNG.CRASH_BET_PLACED + ' (' + data.active_bet.amount + ')');
        __SOCKET_EVENT_CRASH_BET(data.active_bet);
        crash_next_bet = false;
        crash_next_amount = 0;
        crash_next_cashout = 0;
    } else {
        crash_next_bet = 0;
        crash_next_amount = 0;
        crash_next_cashout = 0;
        crash_bet = false;
        crash_amount = 0;
        $('.crash-button-bet').html(LNG.CRASH_PLACE_BET);
    }
    crash_connected = 1;


}

function cd(t, e) {
    $(".bar").finish().css("width", "100%");
    $(".bar").animate({
        'width': '0%'
    }, {
        'duration': t * 1000,
        'easing': 'linear',
        'progress': function(t, e, a) {
            $BANNER.html(LNG.ROLL_TIME.replace('%time%', (a / 1000).toFixed(2)));
        },
        complete: e
    });
}




var bet_tmp = '<li class="list_bet" id="{0}" data-amount="{1}">';
bet_tmp += '<a href="{4}" target="_blank">';
bet_tmp += '<img src="{2}" class="contextmenu" uid="{5}" steamid="{6}" name="{3}" alt="{3}">';
bet_tmp += '<span>{3}</span>';
bet_tmp += '</a>';
bet_tmp += '<strong>{1}</strong>';
bet_tmp += '</li>';

function addBet(t, e) {

    var a = t.user + "-" + t.lower,
        n = "#panel" + t.lower + "-" + t.upper + "-t",
        i = $(n);
    i.find("#" + a).remove();
    var avatar = 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars' + t.icon;
    var link = '#';
    if (t.steamid) {
        link = 'https://steamcommunity.com/profiles/' + t.steamid;
    }

    if(getCookie("settings_dongers") == 'true') {
        t.amount = parseFloat((t.amount / 1000).toFixed(4));
    }

    var o = $(bet_tmp.format(a, t.amount, avatar, t.name, link, t.user, t.steamid));
    o.hide().prependTo(i.find(".betlist")).slideDown("fast", function() {
        snapRender()
    })

    i.find('.totalCount').countTo1(i.find('.list_bet').length);

    try { tinysort('#panel1-7-t     .betlist > li',     {'data': 'amount', 'order': 'desc'}); } catch (a) { }
    try { tinysort('#panel8-14-t    .betlist > li',     {'data': 'amount', 'order': 'desc'}); } catch (a) { }
    try { tinysort('#panel0-0-t     .betlist > li',     {'data': 'amount', 'order': 'desc'}); } catch (a) { }
    
}

function addHist(t, e) {

    if ($(".balls > .ball").length > 9) $(".balls > .ball").first().remove();

    if (t == 0) $(".balls").append("<li class='ball' data-rollid='" + e + "'><span class='green'>" + t + "</span></li>");
    else if (t < 8) $(".balls").append("<li class='ball' data-rollid='" + e + "'><span class='red'>" + t + "</span></li>");
    else $(".balls").append("<li class='ball' data-rollid='" + e + "'><span class='dark'>" + t + "</span></li>");
}

function __SOCKET_EVENT_BET(data) {

    if (SHOWBETS) {

        addBet(data.bet, data.verified);

        if(getCookie("settings_dongers") == 'true') {
            data.sums[0] = parseFloat((data.sums[0] / 1000).toFixed(2));
            data.sums[1] = parseFloat((data.sums[1] / 1000).toFixed(2));
            data.sums[2] = parseFloat((data.sums[2] / 1000).toFixed(2));
        }

        $('#panel0-0-t      .total').countTo(data.sums[0]);
        $('#panel1-7-t      .total').countTo(data.sums[1]);
        $('#panel8-14-t     .total').countTo(data.sums[2]);

    }

}

function __SOCKET_EVENT_BET_CONFIRM(data) {

    if(getCookie("settings_dongers") == 'true') {
        data.bet.amount = parseFloat((data.bet.amount / 1000).toFixed(4));
    }

    $('#panel' + data.bet.lower + '-' + data.bet.upper + '-m .mytotal').countTo(data.bet.amount);

    updateBalance(data.balance, true);

    $('.betButton').prop('disabled', false);

    chat('alert', LNG.BET + data.bet.betid + LNG.CONFIRMED + data.mybr + "/" + data.br + " (" + data.exec / 1e3 + " " + LNG.SEC + ") ");

}

function __SOCKET_EVENT_ROLL(data) {
    

    $('.betButton').prop('disabled', true);
    $('.bar').finish();
    $BANNER.html(LNG.ROLL);

    ROUND = data.rollid;
    SHOWBETS = false;
    spin(data);

    try { tinysort('#panel1-7-t     .betlist > li',     {'data': 'amount', 'order': 'desc'}); } catch (a) { }
    try { tinysort('#panel8-14-t    .betlist > li',     {'data': 'amount', 'order': 'desc'}); } catch (a) { }
    try { tinysort('#panel0-0-t     .betlist > li',     {'data': 'amount', 'order': 'desc'}); } catch (a) { }
}

function __SOCKET_EVENT_ROULETTE_JACKPOT(data) {

    //console.log('J AMOUNT', data);
    setTimeout(function() {
        updateJackpot(data.amount);
    }, 6000)


}

function __SOCKET_EVENT_LOGINS(data) {
    

    $("#online").html(data.count);
    for(room_info of data.rooms) {
        var label = $('#room_list').find('#' + room_info.room).attr('label');
        $('#room_list').find('#' + room_info.room).attr('online', room_info.count);
        $('#room_list').find('#' + room_info.room).html(label + ' ' + '(' + room_info.count + ')');
        if(room_info.room == ROOM) $('.room_online').html(room_info.count + ' / ' + data.count);
    }

}

function __SOCKET_EVENT_HELLO(data) {
    

    cd(data.count);
    USER = data.user;
    RANK = data.rank;
    UNAME = data.name;
    MAX_BET = data.max_bet;
    updateBalance(data.balance, true);

    for (var n = 0, i = 0; i < data.rolls.length; i++) {
        addHist(data.rolls[i].roll, data.rolls[i].rollid);
        n = data.rolls[i].roll;
        ROUND = data.rolls[i].rollid;
    }
    snapRender(n, data.last_wobble);
    updateJackpot(data.jackpot);

        for (var i = 0; i < data.dices.length; i++) {

      
            
            if($('.dice-games > tbody > tr').length < 15) {
            var c_time = new Date(data.dices[i].time * 1000);
            c_time = ('0' + c_time.getHours().toString()).slice(-2) + ':' + ('0' + c_time.getMinutes().toString()).slice(-2) + ':' + ('0' + c_time.getSeconds().toString()).slice(-2);
            var chance = (data.dices[i].target_to - data.dices[i].target_from).toFixed(2);
            var avatar = 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars' + data.dices[i].avatar;
            var profit = data.dices[i].result == 1 ? data.dices[i].profit : data.dices[i].amount * -1;
            var profit_class = data.dices[i].result == 1  ? 'win' : 'lose';
            var link = '#'
            if(data.dices[i].steamid != 0) link = 'https://steamcommunity.com/profiles/' + data.dices[i].steamid;
  
            var dice_bet = dice_bet_tmp.format(data.dices[i].id, c_time, avatar, data.dices[i].username, data.dices[i].amount, chance, data.dices[i].roll, profit_class, profit, link, data.dices[i].steamid, data.dices[i].uid);
            
            $('.dice_bets_table').after($(dice_bet));
            }
            
        }

    chat('alert', LNG.CHAT_HELLO.replace('%min_bet%', formatNum(data.min_bet)).replace('%min_bet_declination%', coins_declination(data.min_bet)).replace('%max_bet%', formatNum(data.max_bet)).replace('%max_bet_declination%', coins_declination(data.max_bet)).replace('%bets_per_roll%', data.bets_per_roll).replace('%bets_per_roll_declination%', games_declination(data.bets_per_roll)).replace('%roll_cooldown%', data.roll_cooldown).replace('%chat_cooldown%', data.chat_cooldown).replace('%chat_balance%', formatNum(data.chat_balance)).replace('%chat_balance_ru%', formatNum(data.chat_balance_ru)).replace('%chat_balance_en%', formatNum(data.chat_balance_en)).replace('%min_bet_matches%', formatNum(data.min_bet_matches)).replace('%min_bet_matches_declination%', coins_declination(data.min_bet_matches)).replace('%max_bet_matches%', formatNum(data.max_bet_matches)).replace('%max_bet_matches_declination%', coins_declination(data.max_bet_matches)));

}

var dice_bet_tmp = '<tr>';
dice_bet_tmp += '<td><span data-type="responsive">Game</span><span class="game_id">{0}</span></td>';
dice_bet_tmp += '<td><span data-type="responsive">Time</span><span>{1}</span></td>';
dice_bet_tmp += '<td><span data-type="responsive">User</span><a href="{9}" target="_blank"  class="table_user"><img src="{2}" alt="{3}" class="contextmenu" steamid="{10}" uid="{11}" name={3}><span>{3}</span></a></td>';
dice_bet_tmp += '<td><span data-type="responsive">Bet</span><span>{4}</span></td>';
dice_bet_tmp += '<td><span data-type="responsive">Chance</span><span>{5}%</span></td>';
dice_bet_tmp += '<td><span data-type="responsive">Roll</span><span>{6}</span></td>';
dice_bet_tmp += '<td><span data-type="responsive">Profit</span><span class="profit {7}">{8}</span></td>';
dice_bet_tmp += '</tr>';



function __SOCKET_EVENT_DICE_ROLL(data) {


    $('#dice_play').prop('disabled', false);
    $("#dice_result").removeClass('dice_result_win');
    $("#dice_result").removeClass('dice_result_lose')

    if (data.result == 1) $("#dice_result").addClass('dice_result_win');
    else $("#dice_result").addClass('dice_result_lose');

    $("#dice_result").show();
    $("#dice_result").text(data.roll);
    var slider_w = $('.dice-slider-block').width();
    var result_w = $("#dice_result").width();
    var left_minus = (result_w / (slider_w / 100)) / 2;
    var result_left = data.roll - left_minus;

    $("#dice_result").animate({
        left: result_left + "%"
    }, 200);

    updateBalance(data.balance, false);



}

function __SOCKET_EVENT_DICE_GAME(data) {

    if(getCookie("settings_dongers") == 'true') {
        data.game.profit = parseFloat((data.game.profit / 1000).toFixed(4));
        data.game.amount = parseFloat((data.game.amount / 1000).toFixed(4));
    }

    if ($('.dice-games > tbody > tr').length >= 15) $('.dice-games > tbody > tr').eq(15).remove();

    var c_time = data.game.time;
    var chance = (data.game.target_to - data.game.target_from).toFixed(2);
    var avatar = 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars' + data.game.avatar;
    var profit = data.game.result == 1 ? data.game.profit : data.game.amount * -1;
    var profit_class = data.game.result == 1  ? 'win' : 'lose';

    var link = '#';
    if(data.game.steamid != 0) {
        link = 'https://steamcommunity.com/profiles/' + data.game.steamid;
    }

    var dice_bet = dice_bet_tmp.format(data.game.id, c_time, avatar, data.game.username, data.game.amount, chance, data.game.roll, profit_class, profit, link, data.game.steamid, data.game.uid);

    if (($("#settings_mydices").is(":checked") && data.game.uid == USER) || !$("#settings_mydices").is(":checked")) {
        $('.dice_bets_table').after($(dice_bet));
    }



}

var message_template = '<div class="message" id={11}>';
message_template += '<div class="userpic contextmenu context-msg" uid="{8}" steamid="{9}" name=\'{10}\' unique_id="{11}">';
message_template += '<a href="#"><img src="{0}" alt="{7}"></a>';
message_template += '</div>';
message_template += '<div class="message_body">';
message_template += '<a href="{1}" target="_blank" class="{3}" {6}>{2}</a>';
message_template += '<span>{4}</span>';
message_template += '<p class="message_text {3}">{5}</p>';
message_template += '</div>';
message_template += '</div>';

var prefix_tmp = '<span {1}>[{0}]</span>';

function send_message() {
    var t = $("#message_text").val();
   
    if (t) {
        var e = null;
        if (e = /^\/send ([0-9]*) ([0-9]*)/.exec(t)) {
            var a = "";
            alerts.confirm(LNG.ABOUT_SEND + e[2] + LNG.COINS_STEAMID + e[1] + LNG.YOU_SURE + '<br><br><div id="captcha"></div>', function(e) {
                e && (send('chat', {
                    msg: t,
                }), $("#message_text").val(""))
            }, 'warn', '', true);
        } else {
            var i = $("#settings_hideme").is(":checked");
            send('chat', {
                msg: t,
                hide: i
            }), $("#message_text").val("")
        }
    }
    return !1
}

$(document).on('click', '#message_send', function() {
    send_message();
});

    function emotes(t) {
        
        for (var e = ["deIlluminati", "KappaRoss", "KappaPride", "BibleThump", "Kappa", "Keepo", "Kreygasm", "PJSalt", "PogChamp", "SMOrc", "CO", "CA", "Tb", "offFire", "Fire", "rip", "lovegreen", "heart", "FailFish", "fist", "Green", "RedG", "BlackG", "TotoR", "TotoB", "DoubleG", "EzSkins", "Diamond", "322", "Vacban", "Dab", "Cry", "Hype", "PogChamp", "Ha"], a = 0; a < e.length; a++)
            t = t.replace(new RegExp(e[a] + "( |$)", "g"), "<img src='img/twitch/" + e[a] + ".png'> ");
        
        return t;
        
    }

function chat(type, message, t, prefix, rank, av, n, steamid, uid, hide, prefix_color, name_color, link_custom, uniq_id, reply, reply_uid) {
    
    var color_style = '';
    var avatar = '';
    var name = '';
    var link = '#';
    var text = emotes(message);
    var time = '';
    var unique_id = '';
    if(uniq_id) unique_id = uniq_id;
    if (t) time = t;
    if ('error' == type) {
        color_style = 'text-error';
        avatar = 'images/chat/server.png';
        name = 'Server';
    } else if ('alert' == type) {
        color_style = 'text-success';
        avatar = 'images/chat/server.png';
        name = 'Alert';
    } else if ('log' == type) {
        color_style = '';
        avatar = 'images/chat/server.png';
        name = 'Info';
    } else {
        avatar = 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars' + av;
        name = n;
    }

    if (prefix) {
        var p_color = '';
        var p = ''
        if(prefix_color != '') p_color = 'style="color: ' + prefix_color + '"';
        name = prefix_tmp.format(prefix, p_color) + ' ' + name;
    }

    var n_color = '';
    if(name_color != '') n_color = 'style="color: ' + name_color + '"';

    if(steamid) link = 'https://steamcommunity.com/profiles/' + steamid;
    if(link_custom != '') link = link_custom;
    
    var reply_text = '';
    if(reply) reply_text = reply;
    if(reply_uid == USER) reply_text = '<a>' + reply_text + '</a>,';
    else if(reply) reply_text = reply_text + ',';
    
    text = reply_text + ' ' + text;
    
    var msg = message_template.format(avatar, link, name, color_style, time, text, n_color, n, uid, steamid, n, unique_id);
    
    if(IGNORE.indexOf(String(uid)) == -1) {
    
        $('.messages').last().append(msg);
        if($('.chat_pause_controller').hasClass('now_play')) {
            var h = $('.messages').last().children().length;
            if (h > 75) {
                var m = h - 75;
                $('.messages').last().children().slice(0, m).remove();
            }
        
        $('.messages').last().scrollTop($('.messages').last()[0].scrollHeight)
        }
    
    }


}

function coins_declination(data) {

    if (data % 10 == 1) return LNG.DECLINATION_A;
    else if (data % 10 > 1 && data % 10 < 5) return LNG.DECLINATION_S;
    else return LNG.DECLINATION_ALL;

}

function games_declination(data) {

    if (data % 10 == 1) return LNG.DECLINATION_A_G;
    else if (data % 10 > 1 && data % 10 < 5) return LNG.DECLINATION_S_G;
    else return LNG.DECLINATION_ALL_G;

}


function changeMode(mode) {

    if ($('#select_' + mode).length) {

        setCookie('mode', mode);
        $('.select_right').hide();
        $('.game_select').removeClass('active');
        $('[game=' + mode + ']').addClass('active');
        $('#select_' + mode).show();
        if (mode != 'crash') crash_disconnect();
        else {
            if (crash_connected == 0) crash_connect();
        }
        if(mode == 'roulette') {
            snapRender();
            SOUND_ENABLE = true;
        } else SOUND_ENABLE = false;
        if(mode == 'coinflip' && coinflip_connected == 0) coinflip_connect();
        if(mode == 'betting') get_matches();
        if(mode == 'tournament') get_tournament();

        MODE = mode;

    }
}

function get_tournament() {
    $.ajax({
        url : '/scripts/tournament/mybet.php',
        type : 'get',
        success : data => {
            data = JSON.parse(data);
            if(data.success) {

                if(data.team != 0) {

                    var coeff = parseFloat($('li[team="'+data.team+'"]').find('.tournament_coefficient').html().replace('x', ''));
                    $('li[team="'+data.team+'"]').find('.tournament').addClass('selected');
                    $('li[team="'+data.team+'"]').addClass('selected');
                    $('li[team="'+data.team+'"]').append('<span class="your_choice">Your choice</span>');
                    $('li[team="'+data.team+'"]').find('.tournament_bet').replaceWith('<div class="tournament_bet_info"><span>'+data.amount+'</span><span> ('+parseInt(data.amount * coeff - data.amount)+')</span></div>');
                }

            } else {
                alerts.notify(data.error, 'Error', 'error', true);
            }
        }, 
        error : err => {
            alerts.notify(err.responseText, 'Error', 'error', true);;
        }
    });
};

$(document).on("click", ".button_amount_cf", function() {
    var t = parseInt($('#coinflip_amount').val()) || 0;
    var a = $(this).attr("action");
    if ("clear" == a)
        t = 0;
    else if ("double" == a)
        t *= 2;
    else if ("half" == a)
        t /= 2;
    else if ("max" == a) {
        var e = MAX_BET;
        t = Math.min(parseInt($("#balance_p").html()), e);
    } else
        "last" == a ? t = 0 : t += parseInt(a);
    $("#coinflip_amount").val(parseInt(t) || 0)
});
$(document).on("click", ".button_amount_r", function() {
    var t = parseInt($('#roulette_amount').val()) || 0;
    var a = $(this).attr("action");
    if ("clear" == a)
        t = 0;
    else if ("double" == a)
        t *= 2;
    else if ("half" == a)
        t /= 2;
    else if ("max" == a) {
        var e = MAX_BET;
        t = Math.min(parseInt($("#balance_r").html()), e);
    } else
        "last" == a ? t = 0 : t += parseInt(a);
    $("#roulette_amount").val(parseInt(t) || 0)
});
$(document).on("click", ".button_amount_c", function() {
    var t = parseInt($('#crash_amount').val()) || 0;
    var a = $(this).attr("action");
    if ("clear" == a)
        t = 0;
    else if ("double" == a)
        t *= 2;
    else if ("half" == a)
        t /= 2;
    else if ("max" == a) {
        var e = MAX_BET;
        t = Math.min(parseInt($("#balance_p").html()), e);
    } else if ("min" == a) {
        t = 10;
    } else
        "last" == a ? t = 0 : t += parseInt(a);
    $("#crash_amount").val(parseInt(t) || 0)
});
$(document).on("click", ".button_amount_d", function() {
    var t = parseInt($('#dice_amount').val()) || 0;

    var a = $(this).attr("action");
    if ("clear" == a)
        t = 0;
    else if ("double" == a)
        t *= 2;
    else if ("half" == a)
        t /= 2;
    else if ("max" == a) {
        var e = MAX_BET;
        t = Math.min(parseInt($("#balance_p").html()), e);
    } else
        "last" == a ? t = 0 : t += parseInt(a);
    $("#dice_amount").val(parseInt(t) || 0)
    dice_calculate();
});

$(document).on('keyup', '#dice_amount', function() {
    dice_calculate();
})

$(document).on('click', '.game_select', function() {

    var mode = $(this).attr('game');
    changeMode(mode);

});


        const crash_bet_req = (a, n, c) => {

            if(getCookie("settings_dongers") == 'true') {
                a = (1000 * a);
            }

            var exec = ((new Date()).getTime());
            $('.crash-button-bet').prop('disabled', true);
            $.ajax({
                url : '/scripts/crash/bet.php',
                type : 'post',
                data : {
                    amount: a,
                    auto: n == true ? c * 100 : 0
                },
                success : data => {
                   data = JSON.parse(data);
                   if(data.success) {

                        if(getCookie("settings_dongers") == 'true') {
                            data.amount = parseFloat((data.amount / 1000).toFixed(2));
                        }

                        updateBalance(data.balance, false);
                        crash_bet = 1
                        crash_amount = data.amount;

                        $('.crash-button-bet').addClass('bet_placed');
                        $('.crash-button-bet').html(LNG.CRASH_BET_PLACED + ' (' + data.amount + ')');
                        $('.crash-button-bet').prop('disabled', false);
                        chat('alert', LNG.BET + data.id + LNG.CONFIRMED + " (" + ((new Date()).getTime() - exec) / 1e3 + " " + LNG.SEC + ") ");
                                        
                        crash_next_bet      = false;
                        crash_next_amount   = 0;
                        crash_next_cashout  = 0;
                    } else {
                        if(data.next_bet) {
                            if(getCookie("settings_dongers") == 'true') {
                                 data.amount = parseFloat((data.amount / 1000).toFixed(2));
                            }
                            crash_next_bet      = 1;
                            crash_next_amount   = data.amount;
                            crash_next_cashout  = data.auto_cashout / 100;
                            $('.crash-button-bet').html(LNG.CRASH_BETTING + ' (' + data.amount + ') ' + LNG.CRASH_CANCEL);
                            $('.crash-button-bet').prop('disabled', false);
                        } else {
                            chat('error', data.error);
                            $('.crash-button-bet').prop('disabled', false);
                        }
                    }
                }, 
                error : err => {
                    $('.crash-button-bet').prop('disabled', false);
                    console.log('New error');
                    console.log(err.responseText);
                }
            });

        }
    
    
     
             $(document).on('click', '.crash-button-click', function() {
    
                if(crash_bet) {
    
                    $.ajax({
                        url : '/scripts/crash/cashout.php',
                        type : 'post',
                        success : data => {
                           data = JSON.parse(data);
                           if(data.success) {
                                crash_bet = false;
                                crash_amount = 0;
                                $('.crash-button-bet').html(LNG.CRASH_PLACE_BET);
                                updateBalance(data.balance, false);
                            } else {
                                chat('error', data.error);
                                $('.crash-button-bet').prop('disabled', false);
                            }
                        }, 
                        error : err => {
                            $('.crash-button-bet').prop('disabled', false);
                            console.log('New error');
                            console.log(err.responseText);
                        }
                    }); 
    
                } else if(!crash_bet && crash_next_bet) {
    
                    crash_next_bet      = false;
                    crash_next_amount   = 0;
                    crash_next_cashout  = 0;
                    $('.crash-button-bet').html(LNG.CRASH_PLACE_BET);
    
                } else {
                    
                    if(getCookie("settings_dongers") == 'true') {
                        var a = parseFloat($('#crash_amount').val()) || 0;   
                    } else {
                        var a = parseInt($('#crash_amount').val()) || 0;
                    }
                    var c = parseFloat($('#crash_auto_cashout').val().replace(',', '.'));
                    var n = $("#settings_confirm").is(":checked");
                    if (n && a > getConfirmBet()) {
                        var i=!1;
                        alerts.confirm(LNG.YOU_SURE_BET + formatNum(a) + LNG.WARNING_BET, function(n) {
                            if(n) {
                                crash_bet_req(a, $('.on_off').hasClass('toggled') ? 0 : 1, c);
                            }
    
                        }, 'warn', '', true);
    
                    } else {
                        crash_bet_req(a, $('.on_off').hasClass('toggled') ? 0 : 1, c);
                    }
                   
                }
             
            });           
 

function getConfirmBet() {
    if(getCookie("settings_dongers") == 'true') {
        return 10;           
    } else {
        return 10000;
    }
 }      


$(document).on('click', '#dice_play', function() {

    if ($('#dice_seed_client').html() == 'Not created yet') {
        var next = $('#dice_next_client').val();
        $.ajax({
            url : '/scripts/dice/change_seed.php',
            type : 'post',
            data : {
                next: next
            },
            success : data => {
                data = JSON.parse(data);
                    if(data.success) {
                        
                       
                        $('#pf_dc_client').html(data.seed_client);
                        $('#dc_pf_server_hasheed').html(data.seed_server_hash);
                        $('#dice_next_client').val(data.next_random);
                        $('#dice_next_server_hashed').val(data.next_hashed);
                        $('#dice_seed_client').html(data.seed_client)
                
        
                    } else {
                        alerts.notify(data.error, 'Error', 'error', true);
                    }
                },
                error : err => {
                    alerts.notify(err.responseText, 'Error', 'error', true);;
                }
            });

    } else {
    
        var n = $("#settings_confirm").is(":checked");
        
        if($("#settings_dongers").is(":checked")) {
            var a = parseFloat($('#dice_amount').val()) || 0;
        } else {
            var a = parseInt($('#dice_amount').val()) || 0;
        }
        var f = parseFloat(dice_number_from);
        var t = parseFloat(dice_number_to);

       
        //return;
        $("#settings_dongers").is(":checked") && (a = 1000 * a), a = Math.floor(a)
        var i = false;
        if (n && a > getConfirmBet()) {
            alerts.confirm(LNG.YOU_SURE_BET + formatNum(a) + LNG.WARNING_BET, function(n) {
                if (n) {
                    $(this).prop('disabled', true);
                    send('dice_bet', {
                        amount: a,
                        number_from: f,
                        number_to: t
                    })
                }
            }, 'warn', '', true);
        } else {
            $(this).prop('disabled', true);
            send('dice_bet', {
                amount: a,
                number_from: f,
                number_to: t
            })
        }

    }
});



$(document).on("click", ".betButton", function() {
    var t = $(this).data("lower"),
        e = $(this).data("upper");
        
    if($("#settings_dongers").is(":checked")) {
        var a = parseFloat($("#roulette_amount").val());
        a = 1000 * a; 
        a = Math.floor(a);
    } else {
        var a = parseInt($("#roulette_amount").val());
    }
    var n = $("#settings_confirm").is(":checked");

    if (n && a > getConfirmBet()) {
        var i = !1;
        alerts.confirm(LNG.YOU_SURE_BET + formatNum(a) + LNG.WARNING_BET, function(n) {
            n && !i && (i = !0, send('bet', {
                amount: a,
                lower: t,
                upper: e,
                round: ROUND,
                hide: n
            }), LAST_BET = a, $(this).prop("disabled", !0))
        }, 'warn', '', true)
    } else
        send('bet', {
            amount: a,
            lower: t,
            upper: e,
            round: ROUND,
            hide: n
        }), LAST_BET = a, $(this).prop("disabled", !0);
    return !1
})

$(document).on("click", "#balance_update", function() {
    send('balance');
});

$(document).on('click', '.room_select', function() {
    var room = $(this).attr('room');
    if(room != ROOM) {
        var text = $(this).text();
        var replace = $(this).clone();
        replace.html(replace.html().split('(')[0])
        $('.active_room').find('span').replaceWith(replace);
        $('.room_online').html($(this).attr('online') + ' / ' + parseInt($('#online').html()));
        ROOM = room;
        send('room_change', room);
        chat("alert", LNG.CHANGE_ROOM + text.split('(')[0])
    }
});

var gradientStroke;
var gradientStrokeLose;
window.onload = function() {
    
    $( window ).resize(function() {
        CASEW = $CASE.width();
        console.log(CASEW, '1');
    });

    if(window.innerWidth <= 800) {

        $(document).on('click', '.contextmenu', function(t){
            cmenu(t, $(this));
        });

    }

    window.responsiveTables.init();
    var ctx = document.getElementById('canvas').getContext('2d');
    gradientStroke = ctx.createLinearGradient(0, 0, 800, 500);
    gradientStroke.addColorStop(0, 'rgb(94, 183, 110, .4)');
    gradientStroke.addColorStop(1, 'rgb(94, 183, 110, 0)');
    gradientStrokeLose = ctx.createLinearGradient(0, 0, 800, 500);
    gradientStrokeLose.addColorStop(0, 'rgb(252, 25, 28, .4)');
    gradientStrokeLose.addColorStop(1, 'rgb(234, 47, 43, 0)');    
    Chart.defaults.global.defaultFontFamily = "DIN Pro";
    Chart.defaults.global.defaultFontSize = "13";
    Chart.defaults.global.defaultFontColor = "#909092";

    var config = {
        type: 'line',
        data: {
            labels: [0],
            datasets: [{
                borderDash: [10],
                borderWidth: [4],
                pointBackgroundColor: 'rgba(0, 0, 0, 0)',
                pointColor: 'rgba(0, 0, 0, 0)',
                pointRadius: 0,
                pointBorderWidth: 0,
                borderColor: 'rgb(94, 183, 110)',
                backgroundColor: gradientStroke,
                data: [0]
            }]
        },
        options: {
            tooltips: {
                enabled: false
            },
            legend: {
                display: false
            },
            scales: {
                xAxes: [{
                    display: false,
                    scaleLabel: {
                        display: true
                    },
                    gridLines: {
                        display: false,
                    },
                    ticks: {
                        min: 1,
                        stepSize: 1,
                        display: false,
                    }
                }],
                yAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true
                    },
                    ticks: {
                        beginAtZero: true,
                        min: 1,
                        max: 2,

                    }
                }]
            }
        }
    };
    window.myLine = new Chart(ctx, config);
};



    var COIN_2 = '<div class="flip">'
    COIN_2 += '<div class="coinflip-coin-container" style="animation-name: coinflip-move-2-4;">';
    COIN_2 += '<div class="coinflip-coin-gif" style="animation-name: coinflip-rotate-5; background-image: url(\'/images/coinflip/aa.png\');">';
    COIN_2 += '<div class="coinflip-sprite-container">'
    COIN_2 += '<div class="coinflip-sprite" style="background-image: url(\'/images/coinflip/aa.png\');"></div>';
    COIN_2 += '</div>';
    COIN_2 += '</div>';
    COIN_2 += '</div>';
    COIN_2 += '</div>';

    var COIN_1 = '<div class="flip">'
    COIN_1 += '<div class="coinflip-coin-container" style="animation-name: coinflip-move-2-4;">';
    COIN_1 += '<div class="coinflip-coin-gif" style="animation-name: coinflip-rotate-5; background-image: url(\'/images/coinflip/bb.png\');">';
    COIN_1 += '<div class="coinflip-sprite-container">'
    COIN_1 += '<div class="coinflip-sprite" style="background-image: url(\'/images/coinflip/bb.png\');"></div>';
    COIN_1 += '</div>';
    COIN_1 += '</div>';
    COIN_1 += '</div>';
    COIN_1 += '</div>';

var coinflip_tmp = '<div class="coinflip_unit" data-amount="{3}" id="cf{7}">';

    coinflip_tmp += '<div class="coinflip_user side_0{0}">';
    coinflip_tmp += '<div class="coinflip_user_pic"><img src="{1}" alt="{2}" width="80px" height="80px"></div>';
    coinflip_tmp += '<h3>{2}</h3>'; 
    coinflip_tmp += '<div class="coinflip_cash neutral" id="side{0}"><span>{3}</span></div>';
    coinflip_tmp += '</div>';

    coinflip_tmp += '<div class="coinflip_user side_0{4}">';
    coinflip_tmp += '<div class="coinflip_user_pic"><img src="{5}" class="opponent_avatar" alt="{6}" width="80px" height="80px"></div>';

    coinflip_tmp += '<div class="coinflip_waiting">';
    coinflip_tmp += '<h3 class="opponent_name">{6}</h3>';
    coinflip_tmp += '<button type="button" name="button" class="coinflip_waiting_cancel" cf_id="{7}">Cancel</button>';
    coinflip_tmp += '<a href="#" class="coinflip_waiting_call" cf_id="{7}">Call a bot</a>';
    coinflip_tmp += '</div>';

    coinflip_tmp += '</div>';

    coinflip_tmp += '<span class="coinflip_unit_counter">VS</span>';
    coinflip_tmp += '<span class="coinflip_unit_provably" public="{8}" private="{9}" gid="{7}" eos="{10}">Provably fair</span>';
    coinflip_tmp += '</div>';

var opponent_tmp = '<h3>{0}</h3>'; 
    opponent_tmp += '<div class="coinflip_cash neutral" id="side{2}"><span>{1}</span></div>';

var opponent_avatar_tmp = '<img src="{0}" class="opponent_avatar" alt="{1}" width="80px" height="80px">';
      

var join_tmp = '<div class="coinflip_waiting">';
    join_tmp += '<h3>Waiting...</h3>';
    join_tmp += '<button type="button" name="button" class="coinflip_waiting_join" cf_id="{0}"">Join game</button>';
    join_tmp += '</div>';

var dismiss_tmp = '<div class="dismiss"><button class="dismiss-button" cf_id="{0}"> Dismiss </button></div>';

$(document).on('click', '.side_item', function() {
    $('.side_item').removeClass('current');
    $(this).addClass('current');
})

function add_coinflip(data) {

    if(getCookie("settings_dongers") == 'true') { 
        data.amount = parseFloat((data.amount / 1000).toFixed(4));
    }

    var creator_avatar = 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars' + data.creator_avatar;
    var opponent_side = data.creator_side == 1 ? 2 : 1;
    var opponent_avatar = data.opponent_avatar ? ('https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars'+data.opponent_avatar) : 'images/coinflip/default_userpic.png';
    var opponent_name = data.opponent_name ? data.opponent_name : 'WAITING..';

    var public = data.seed_public;
    var private = data.seed_private ? data.seed_private : 'hidden';
    var eos = data.eos_block ? data.eos_block : 'waiting for opponent..';
    console.log(eos)

    var cf = coinflip_tmp.format(data.creator_side, creator_avatar, data.creator_name, data.amount, opponent_side, opponent_avatar, opponent_name, data.id, public, private, eos);
    cf = $(cf);
    var join = join_tmp.format(data.id);


    if(data.creator_uid == USER) {
        if(!data.socket) $(cf).appendTo($('#coinflip_mygames'));
        calculate_coinflip();
    } else {

        cf.find('.coinflip_waiting').replaceWith($(join));
        var sort = $('.coinflip_sort_click').attr('sort');
        var insert = 0;
        

            $('#coinflip_allgames').find('.coinflip_unit').each(function() {
                var amount = parseInt($(this).attr('data-amount'));
                data.amount = parseInt(data.amount);
                if(sort == 'low') {
                    if(data.amount <= amount) {
                        $(cf).insertBefore($(this));
                        insert = 1;
                    }
                } else {
                    if(data.amount >= amount) {
                        $(cf).insertBefore($(this));
                        insert = 1;
                    }
                }
            });;

            if(insert == 0) {
                $(cf).appendTo($('#coinflip_allgames'));  

            }
        
         
        calculate_coinflip();

    }

    if(data.instant) play_coinflip(data, 5);
}

function delete_coinflip(id) {
    $('#cf' + id).remove();
}


function play_coinflip(data, i) {


    if(getCookie("settings_dongers") == 'true' && i == 5) { 
        data.win = parseFloat((parseFloat(data.win) / 1000).toFixed(4));
        console.log('DATAWIN', data.win)
        data.amount = parseFloat((data.amount / 1000).toFixed(4));
    }

    if((data.opponent_uid == USER) && data.socket == true) return;

    var opponent_avatar = opponent_avatar_tmp.format('https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars' + data.opponent_avatar, data.opponent_name);

    var opponent = opponent_tmp.format(data.opponent_name, data.amount, data.creator_side == 1 ? 2 : 1);
    $('#cf' + data.id).find('.opponent_avatar').replaceWith($(opponent_avatar))
    $('#cf' + data.id).find('.coinflip_waiting').replaceWith($(opponent));
    
    $('#cf' + data.id).find('.coinflip_unit_provably').attr('eos', data.eos_block);
    $('#cf_pf_eos[gid="' + data.id +'"]').html(data.eos_block);
    $('#cf_pf_eos[gid="' + data.id +'"]').attr('num', data.eos_block);

    if(i > 0 && !data.instant) {

        $('#cf' + data.id).find('.coinflip_unit_counter').html(i);
            i--;
            setTimeout(function() {
                play_coinflip(data, i);
            }, 1000)

        } else {


            var coin = data.result == 1 ? COIN_1 : COIN_2;
            $('#cf' + data.id).find('.coinflip_unit_counter').replaceWith($(coin));
            setTimeout(function() {
                var win = data.result;
                var lose = win == 1 ? 2 : 1;

                $('#cf' + data.id).find('#side' + win).removeClass('neutral').addClass('winner').append('<h3>winner</h3>');
                $('#cf' + data.id).find('#side' + win).find('span').html(data.win);
                $('#cf' + data.id).find('#side' + lose).removeClass('neutral').addClass('loser').append('<h3>loser</h3>');

                $('#cf' + data.id).find('.coinflip_unit_provably').attr('private', data.seed_private);
                $('#cf' + data.id).find('.coinflip_unit_provably').addClass('cf_pf')
                $('#cf_pf_private[gid="' + data.id +'"]').html(data.seed_private);
                //$('#cf' + data.id).addClass('game_end_a');

           
                if(data.creator_uid == USER) {
                    
                    var ds = dismiss_tmp.format(data.id);
                    $('#cf' + data.id).append($(ds));
                } else {
                    setTimeout(function() {
                        $('#coinflip_allgames').find($('#cf' + data.id)).remove();
                       calculate_coinflip();
                    }, 5000)
                }

                if((data.creator_uid == USER || data.opponent_uid == USER) && !data.instant) send('balance', {cf: 1});

            }, 1970)
           

        }
}

$(document).on('click', '.coinflip_unit_provably', function() {
    var public = $(this).attr('public');
    var private = $(this).attr('private');
    var gid = $(this).attr('gid');
    var eos = $(this).attr('eos');

    $('#cf_pf_id').attr('gid', gid);
    $('#cf_pf_id').html(gid);

    $('#cf_pf_public').attr('gid', gid);
    $('#cf_pf_public').html(public);

    $('#cf_pf_private').attr('gid', gid);
    $('#cf_pf_private').html(private);
    
    $('#cf_pf_eos').attr('gid', gid)
    $('#cf_pf_eos').attr('num', eos);
    $('#cf_pf_eos').html(eos);

    modal('.cf_provably', true);
})

$(document).on('click', '.dismiss-button', function() {
    var id = $(this).attr('cf_id');
    $(this).prop('disabled', true);
    $.ajax({
        url : '/scripts/coinflip/dismiss.php',
        type : 'post',
        data : {
            id: id
        },
        success : data => {
            data = JSON.parse(data);
            if(data.success) {
                $(this).prop('disabled', false);
                delete_coinflip(data.id);
            } else {
                chat('error', data.error);
                $(this).prop('disabled', false);
            }
        },
        error : err => {
            $(this).prop('disabled', false);
            console.log('New error');
            console.log(err.responseText);
        }
    });
});

$(document).on('click', '.coinflip_waiting_join', function() {
    var id = $(this).attr('cf_id');
    $(this).prop('disabled', true);
    var secret = $('.game_secret').attr('secret');
    $.ajax({
        url : '/scripts/coinflip/join.php',
        type : 'post',
        data : {
            id: id,
            secret
        },
        success : data => {
            data = JSON.parse(data);
            if(data.success) {
                $(this).prop('disabled', false);
                play_coinflip(data, 5);
            } else {
                chat('error', data.error);
                $(this).prop('disabled', false);
            }
        },
        error : err => {
            $(this).prop('disabled', false);
            console.log('New error');
            console.log(err.responseText);
        }
    });
});

$(document).on('click', '.coinflip_waiting_call', function() {
    var id = $(this).attr('cf_id');
    $(this).prop('disabled', true);
    var secret = $('.game_secret').attr('secret');
    $.ajax({
        url : '/scripts/coinflip/call_bot.php',
        type : 'post',
        data : {
            id: id,
            secret: secret
        },
        success : data => {
            data = JSON.parse(data);
            if(data.success) {
                $(this).prop('disabled', false);
                play_coinflip(data, 5);
            } else {
                chat('error', data.error);
                $(this).prop('disabled', false);
            }
        },
        error : err => {
            $(this).prop('disabled', false);
            console.log('New error');
            console.log(err.responseText);
        }
    });
});

$(document).on('click', '.coinflip_waiting_cancel', function() {
    var id = $(this).attr('cf_id');
    $(this).prop('disabled', true);
    $.ajax({
        url : '/scripts/coinflip/cancel.php',
        type : 'post',
        data : {
            id: id
        },
        success : data => {
            data = JSON.parse(data);
            if(data.success) {
                $(this).prop('disabled', false);
                delete_coinflip(data.id);
            } else {
                chat('error', data.error);
                $(this).prop('disabled', false);
            }
        },
        error : err => {
            $(this).prop('disabled', false);
            console.log('New error');
            console.log(err.responseText);
        }
    });
});

$(document).on('click', '#coinflip_create', function() {
    var side = $('.side_item.current').attr('side');
    if(getCookie("settings_dongers") == 'true') {
        var amount = parseFloat($('#coinflip_amount').val());
        amount = (amount * 1000);
    } else {
        var amount = parseInt($('#coinflip_amount').val());
    }

    $('#coinflip_create').prop('disabled', true);
    var secret = $('.game_secret').attr('secret');
    $.ajax({
        url : '/scripts/coinflip/create.php',
        type : 'post',
        data : {
            amount: amount,
            side: side,
            secret: secret
        },
        success : data => {
            data = JSON.parse(data);
            if(data.success) {
                $('#coinflip_create').prop('disabled', false);
                add_coinflip(data);
            } else {
                chat('error', data.error);
                $('#coinflip_create').prop('disabled', false);
            }
        },
        error : err => {
            $('#coinflip_create').prop('disabled', false);
            console.log('New error');
            console.log(err.responseText);
        }
    });
});

function __SOCKET_EVENT_COINFLIP_CREATE(data) {
    add_coinflip(data);
}

function __SOCKET_EVENT_COINFLIP_JOIN(data) {

    play_coinflip(data, 5);
}

function __SOCKET_EVENT_COINFLIP_CANCEL(data) {
    delete_coinflip(data.id);
}
        


$(document).on('click', '.round_players_show_button', function() {
    
    $(this).toggleText('Show users', 'Hide users');
    $(this).toggleClass('active');
    var type = $(this).attr('type');

    $('.round_players[type="'+type+'"]').toggleClass('users_show');
     
});

var match_tmp = '<div class="betting_event_unit {19}" matchid="{0}" time="{17}" matchdata=\'{18}\'>';

    match_tmp += '<div class="betting_event_leftside {12}">';
    match_tmp += '<div class="betting_event_side_row">';
    match_tmp += '<div class="betting_team"><h3>{1}</h3><span class="betting_players"><i>{2}</i></span></div>';
    match_tmp += '<div class="betting_logo"><img src="{3}"  height="61px" alt="{1}"></div>';
    match_tmp += '<div class="betting_description"><span class="percent {15}">{4}</span><span class="coefficient">x{5}</span></div>';
    match_tmp += '</div>';
    match_tmp += '</div>';

    match_tmp += '<div class="bet_event_middle">'
    match_tmp += '<h3>{6}</h3>';
    match_tmp += '{14}';
    match_tmp += '</div>';

    match_tmp += '<div class="betting_event_rightside {13}">';
    match_tmp += '<div class="betting_description"><span class="percent {16}">{7}</span><span class="coefficient">x{8}</span></div>';
    match_tmp += '<div class="betting_logo"><img src="{9}" height="61px" alt="{10}"></div>';
    match_tmp += '<div class="betting_team"><h3>{10}</h3><span class="betting_players"><i>{11}</i></span></div>';
    match_tmp += '</div>';

    match_tmp += '</div>';

function get_matches() {

    $.ajax({
        url : 'scripts/matches/games.php',
        type : 'get',
        success : data => {
            $('#select_betting').show();
            $('#betting_open').hide();
            data = JSON.parse(data);
            if(data.success) {
                
                var mclass = '';
                
                updateJackpotMatch(data.jackpot);
                
                $('.betting_events').html('');
                var matches = data.matches;
                for(var m = 0; m < matches.length; m++) {
                    match = matches[m];
                    

                    if(match.start / 86400 > 1) {
                        var T_M = Math.floor(match.start / 86400);
                        var M_M = T_M + (T_M % 10 == 1 && T_M != 11 ? LNG.DAY_MATCH : (T_M < 5 ? LNG.DAY_S_MATCH : LNG.DAY_V_MATCH)) + LNG.FROM_NOW;
                    } else if(match.start / 3600 > 1) {
                        var T_M = Math.floor(match.start / 3600);
                        var M_M = T_M + LNG.HOUR_MATCH + (T_M % 10 == 1 && T_M != 11  ? '' : (T_M < 5 || T_M > 20 ? LNG.S_MATCH : LNG.V_MATCH)) + LNG.FROM_NOW;
                    } else if(match.start / 60 > 1) {
                        var T_M = Math.floor(match.start / 60);
                        var M_M = T_M + LNG.MINUTE_MATCH + (T_M % 10 == 1 && T_M != 11 ? LNG.S_MATCH : (T_M < 5 ? LNG.D_MATCH : '')) + LNG.FROM_NOW;
                    } else M_M = LNG.SOON_START;

                

                var img_1 = '/img/teams/' + match.logo_1;
                var img_2 = '/img/teams/' + match.logo_2;
                var winner_1 = '';
                var winner_2 = '';
                if(match.status == 2) {
                    winner_1 = match.winner == 1 ? 'win' : 'lose';
                    winner_2 = match.winner == 2 ? 'win' : 'lose';
                }

                var percent_1 = match.status == 2 ? (match.winner == 1 ? 'WIN' : 'LOSE') : (match.all_percent_t1 + '%');
                var percent_2 = match.status == 2 ? (match.winner == 2 ? 'WIN' : 'LOSE') : (match.all_percent_t2 + '%');
                var class_1 = match.status == 2 ? (match.winner == 1 ? 'green' : 'red') : (match.all_percent_t1 < match.all_percent_t2 ? 'green' : 'red');
                var class_2 = match.status == 2 ? (match.winner == 2 ? 'green' : 'red') : (match.all_percent_t2 < match.all_percent_t1 ? 'green' : 'red');

                var bet_button = '<button class="bet_button" onCLick="getMatch('+match.id+')">Bet</button><span class="timer">'+M_M+'</span>';
                if(match.winner == 0 && match.status == 2) {
                    bet_button = '<span>'+LNG.CANCELED+'</span>';
                    mclass = "canceled finished";
                } else if(match.status == 2) {
                    var res = match.result;
                    mclass = "finished";
                    try {

                        var resdata = res.split('-');
                        var res_1 = parseInt(resdata[0]);
                        var res_2 = parseInt(resdata[1]);
                        bet_button = '<div class="bet_event_score"><span class="bet_event_score_'+(res_1 < res_2 ? 'lose' : 'win')+'">'+res_1+'</span><span class="bet_event_score_'+(res_2 < res_1 ? 'lose' : 'win')+'">'+res_2+'</span></div>';

                    } catch(e) {
                        bet_button = '<span>'+match.result+'</span>'
                    }
                } else if(match.status == 1) {
                    bet_button = '<span class="live" onCLick="getMatch('+match.id+')">Live</span>';
                }
              
              
                var time = match.status == 2 ? 1000000000 : match.start;

                var match_add = match_tmp.format(match.id, match.team_1, match.count_1, img_1, percent_1, match.k_1, match.tournament, percent_2, match.k_2, img_2, match.team_2, match.count_2, winner_1, winner_2, bet_button, class_1, class_2, time, JSON.stringify(match), mclass);
                
                $('.betting_events').append($(match_add));

                }

                calculate_matches();
    
        

            } else {
                alerts.notify(data.error, 'Error', 'error', true);
            }
        },
        error : err => {
            alerts.notify(err.responseText, 'Error', 'error', true);;
        }
    });

}

var coef = 1;

var mybet_tmp = '<div class="your_bet_row" team="{6}"">';

    mybet_tmp += '<div class="your_bet_row_pic"><img src="{0}" alt="" height="43px"></div>';
    mybet_tmp += '<div class="your_bet_row_info">';
    mybet_tmp += '<p><i class="mybet_a">{1}</i> <span>({2})</span></p>';
    mybet_tmp += '<p>X{3} <span>{4}</span></p>';
    mybet_tmp += '</div>';
    mybet_tmp += '<span class="cancel_bet" matchid="{5}">Cancel</span>';
    mybet_tmp += '</div>';

function getMatch(id) {
    
    var match = JSON.parse($('.betting_event_unit[matchid="'+id+'"]').attr('matchdata'));
    $('#htlv_link').attr('href', match.hltv);
    $('#betting_open_tournament').html(match.tournament);
    $('.name_1').html(match.team_1 + ' ');
    $('#all_1').html(match.all_t1 + ' ');
    $('#percent_1').html(match.all_percent_t1 + '%');
    $('#logo_1').attr('src', '/img/teams/' + match.logo_1)
    $('#coef_1').html('X' + match.k_1);
    $('#matches_change').attr('matchid', match.id);
    $('.name_2').html(match.team_2 + ' ');
    $('#all_2').html(match.all_t2 + ' ');
    $('#percent_2').html(match.all_percent_t2 + '%');
    $('#logo_2').attr('src', '/img/teams/' + match.logo_2);
    $('#coef_2').html('X' + match.k_2);

    $('.match_status').attr('matchid', match.id);

    $('#bo').html('Best of ' + match.bo);

    $('.betting_select_team').attr('matchid', match.id);
    $('.betting_select_team[team="1"]').attr('coef', match.k_1)
    $('.betting_select_team[team="2"]').attr('coef', match.k_2)

    $('#select_betting').hide();
    $('#betting_open').show();

    $('#matches_mybets').html('');
    if(match.bets) {
        console.log(match.bets)
        if(getCookie("settings_dongers") == 'true') {
            match.bets.myBet = parseFloat((match.bets.myBet / 1000).toFixed(2));
            match.bets.win = parseFloat((match.bets.win / 1000).toFixed(2)); 
        }
        var bet = mybet_tmp.format('/img/teams/' + match.bets.logo, match.bets.myBet, match.bets.win, match.bets.coef, match.bets.time, match.id, match.bets.t);
        $('#matches_mybets').append($(bet));
    }


}

function calculate_matches() {

    tinysort('.betting_event_unit', {'attr': 'time', 'order': 'asc'});
    $('#matches_count').html($('.betting_event_unit:not(.finished)').length);


}

$(document).on('click', '#matches_back', function() {
    
    get_matches();
     
});

$(document).on('keyup', '#m_amount', function() {
    calc_win();
});

function calc_win() {
    var bets_1 = parseInt($('#all_1').html());
    var bets_2 = parseInt($('#all_2').html());
    if(getCookie("settings_dongers") == 'true') {
        bets_1 = parseFloat((bets_1 / 1000).toFixed(2));
         bets_2 = parseFloat((bets_2 / 1000).toFixed(2));
    }
    var team = $('.betting_select_team.selected').attr('team');

    var amount = parseFloat($('#m_amount').val());
        if(getCookie("settings_dongers") == 'true') {
            win = parseFloat(amount * coef).toFixed(2);
        } else {
            win = parseInt(amount * coef);
        }

    var selected_team = $('.your_bet_row').attr('team');

    if(team) {
        if(team == 1) {
            bets_1 = bets_1 + amount;
            if(selected_team && selected_team != team) {
                var a = parseFloat($('.mybet_a').html());
                bets_2 = bets_2 - a;
                bets_1 = bets_1 + a;
            }
            coef = parseFloat((100 / (bets_1 / (bets_1 + bets_2) * 105)));
        } else {
            bets_2 = bets_2 + amount;
            if(selected_team && selected_team != team) {
                var a = parseFloat($('.mybet_a').html());
                bets_1 = bets_1 - a;
                bets_2 = bets_2 + a;
            }            
            coef = parseFloat((100 / (bets_2 / (bets_1 + bets_2) * 105)));
        }
        if(coef < 1) coef = 1;
        
        console.log('c', coef)

        if(getCookie("settings_dongers") == 'true') {
            win = parseFloat(amount * coef).toFixed(2);
        } else {
            win = parseInt(amount * coef);
        }
        

    }
    console.log('bets1', bets_1, 'bets2', bets_2, 'team', team)
 
    $('#m_win').val(win)
}

$(document).on('click', '.betting_select_team', function() {
    
    $('.betting_select_team').removeClass('selected');
    $(this).addClass('selected');
    var amount = $('#m_amount').val();
    coef = $(this).attr('coef');
    calc_win();

});

$(document).on('click', '#m_bet', function() {
    var secret = $('.game_secret').attr('secret');
    if(!$('.betting_select_team.selected').length) {
        alerts.notify('Please select team', 'Error', 'error', false);
    } else {
        $('#m_bet').prop('disabled', true);
        var team = $('.betting_select_team.selected').attr('team');
        

        if(getCookie("settings_dongers") == 'true') {
            var amount = parseFloat($('#m_amount').val());
            amount = (amount * 1000);
        } else {
            var amount = parseInt($('#m_amount').val());
        }

        var match = $('.betting_select_team.selected').attr('matchid');
        $.ajax({
            url : 'scripts/matches/bet.php',
            type : 'post',
            data : {
                team: team,
                id: match,
                amount: amount, 
                secret: secret
            },
            success : data => {
                $('#m_bet').prop('disabled', false);
                data = JSON.parse(data);
                if(data.success) {

                    
                    alerts.notify('', 'success', 'success', false);
                    data = data.data;

                    if(getCookie("settings_dongers") == 'true') {
                        data.amount = parseFloat((data.amount / 1000).toFixed(2));
                        data.win = parseFloat((data.win / 1000).toFixed(2));
                    }

                    $('#coef_1').html('X' + data.k_1);
                    $('#coef_2').html('X' + data.k_2);
                    $('#percent_1').html(data.all_percent_t1 + '%');
                    $('#percent_2').html(data.all_percent_t2 + '%');
                    $('#all_1').html(data.all_t1 + ' ');
                    $('#all_2').html(data.all_t2 + ' ');
    
                    
                    
                    $('#matches_mybets').html('');
                   
                    var bet = mybet_tmp.format('/img/teams/' + data.logo, data.amount, data.win, (data.team == 1 ? data.k_1 : data.k_2), data.time, match);
                    $('#matches_mybets').append($(bet));
            
    
                } else {
                    alerts.notify(data.error, 'Error', 'error', true);
                }
            },
            error : err => {
               $('#m_bet').prop('disabled', false);
                alerts.notify(err.responseText, 'Error', 'error', true);;
            }
        });
    }
})

$(document).on('click', '.cancel_bet', function() {
    var id = $(this).attr('matchid');
    alerts.confirm('Cancel bet?', function() {
        
        $.ajax({
            url : 'scripts/matches/cancel.php',
            type : 'post',
            data : {
                id: id
            },
            success : data => {
                data = JSON.parse(data);
                if(data.success) {
                    
                    $('.your_bet_row').remove();
                    getMatch(id);
    
                } else {
                    alerts.notify(data.error, 'Error', 'error', true);
                }
            },
            error : err => {
                alerts.notify(err.responseText, 'Error', 'error', true);;
            }
        });
        
    }, 'warn', 'warn', true);
});

function cmenu(t, self) {

    if (!t.ctrlKey) {
        t.preventDefault();
        var uid = $(self).attr("uid"); 
        var name = $(self).attr("name");
        var steamid = $(self).attr("steamid");
        $(".u_actions [data-act=0]").html(name);
        var n = $(".u_actions");
        n.find('a[data-act="9"]').hide();
        if(self.hasClass('context-msg')) n.find('a[data-act="9"]').show();
        n.show().css({
            position: "absolute",
            left: getMenuPosition(t.clientX, "width", "scrollLeft"),
            top: getMenuPosition(t.clientY, "height", "scrollTop")
        }).addClass('active').off("click").on("click", "a", function(t) {
            var i = $(this).data("act");
            if (t.preventDefault(), n.hide(), 0 == i) {
                $("#message_text").val(uid)
            } else if (1 == i) {
                modal('.mute_user');
                $("#mute_uid").val(uid);
            }
            else if (2 == i) {
                $("#message_text").val("/kick " + uid + " ")
            } else if (3 == i) {
                $("#message_text").val("/send " + uid + " ")
            } else if (4 == i)
                IGNORE.push(String(uid)), chat("alert", uid + LNG.IGNORED);
            else if (5 == i) {
                $("#message_text").val(uid + '@' + name.replace(/ /g, '_').replace(/\@/g, '').replace(/\,/g, '') + ", ")
            } else if (6 == i) {
                               // $("#muteHistoryModal").modal(), $("#muteHistoryId").html(e), $("#muteHistoryName").html(a), getBanList(e);
            } else if (7 == i) {
            // blockUser(a, e);
            } else if (8 == i) {
            // $("#tradeHistoryModal").modal(), $("#tradeHistoryId").html(e), $("#tradeHistoryName").html(a), getTradeList(a, e);
            } else if(9 == i) {
                var e = $(self).attr("unique_id");
                send('remove_msg', {
                    id: e
                })
            }
            $("#message_text").focus();
        })
    }   
}

$(document).on("click", function(t) {
    if (!$(t.target).is("img, .contextmenu")) {
        $(".u_actions").hide();
    }

})

$(document).on("contextmenu", ".contextmenu", function(t) {
            
cmenu(t, $(this));

});

$(document).on("click", ".contextmenu", function(t) {
    
    if(window.innerWidth <= 800) {
        cmenu(t, $(this))
    }

});

function getMenuPosition(t, e, a) {
        var n = $(window)[e](), i = $(window)[a](), s = $(".u_actions")[e](), o = t + i;
        return t + s > n && t > s && (o -= s), o
}

function updateJackpot(jackpot) {
    
    $('.poly_jackpot.jackpot_roulette').attr('poly-jackpot', jackpot);
    var jackpot_length = jackpot.toString().length;
    var li_length = $(document).find('.poly_jackpot.jackpot_roulette').find('li').length;
    
    if(jackpot_length > li_length) {
        for(var j = 0; j < (jackpot_length - li_length); j++) {
            $(document).find('.poly_jackpot.jackpot_roulette').append('<li> <span class="odometer odometer-theme-minimal">0</span> </li>');
        }
    } else if(jackpot_length < li_length) {
        for(var j = 0; j < (li_length - jackpot_length); j++) {
             $(document).find('.poly_jackpot.jackpot_roulette').find('li:last-child').remove();
        }
       
    }
    
    if($(document).find('.poly_jackpot.jackpot_roulette').length) {
      var polyJackpot = $(document).find('.poly_jackpot.jackpot_roulette').attr('poly-jackpot');
      var polyJackpotIndex = polyJackpot.length + 1;
      var b = String(polyJackpot).split("");
      var polyChecker = 0;
      for (i=0; i<=polyJackpot.length; i++) {
        $(document).find('.poly_jackpot.jackpot_roulette li:nth-of-type('+ i +') span').html(b[(i-1)]);
      }
    }
    
}

function updateJackpotMatch(jackpot) {
    
    $('.poly_jackpot.jackpot_match').attr('poly-jackpot', jackpot);
    var jackpot_length = jackpot.toString().length;
    var li_length = $(document).find('.poly_jackpot.jackpot_match').find('li').length;
    
    if(jackpot_length > li_length) {
        for(var j = 0; j < (jackpot_length - li_length); j++) {
            $(document).find('.poly_jackpot.jackpot_match').append('<li> <span class="odometer odometer-theme-minimal">0</span> </li>');
        }
    } else if(jackpot_length < li_length) {
        for(var j = 0; j < (li_length - jackpot_length); j++) {
             $(document).find('.poly_jackpot.jackpot_match').find('li:last-child').remove();
        }
       
    }
    
    if($(document).find('.poly_jackpot.jackpot_match').length) {
      var polyJackpot = $(document).find('.poly_jackpot.jackpot_match').attr('poly-jackpot');
      var polyJackpotIndex = polyJackpot.length + 1;
      var b = String(polyJackpot).split("");
      var polyChecker = 0;
      for (i=0; i<=polyJackpot.length; i++) {
        $(document).find('.poly_jackpot.jackpot_match li:nth-of-type('+ i +') span').html(b[(i-1)]);
      }
    }
    
}

$(document).on('click', '.crash-history  li', function() {
    var hash = $(this).attr('data-hash');
    var id = $(this).attr('data-id');
    var seed = $(this).attr('data-seed');
    
    $('.crash_provably').find('#crash_pf_id').html(id);
    $('.crash_provably').find('#crash_pf_hash').html(hash);
    $('.crash_provably').find('#crash_pf_private').html(seed);
    
    modal('.crash_provably');
    
});

$(document).on('click', '#dice_change_seed', function() {
   modal('.dc_provably')
});

$(document).on('click', '.save_new_seed', function() {
    var next = $('#dice_next_client').val();
    alerts.confirm('Change current seed to '+next+'?', function(r) {
        if (r) {
            
            $.ajax({
                url : '/scripts/dice/change_seed.php',
                type : 'post',
                data : {
                    next: next
                },
                success : data => {
                   
                    data = JSON.parse(data);
                    if(data.success) {
                        
                        alerts.notify('', 'success', 'success', false);
                        $('#pf_dc_client').html(data.seed_client);
                        $('#dc_pf_server_hasheed').html(data.seed_server_hash);
                        $('#dice_next_client').val(data.next_random);
                        $('#dice_next_server_hashed').val(data.next_hashed);
                        $('#dice_seed_client').html(data.seed_client)
                
        
                    } else {
                        alerts.notify(data.error, 'Error', 'error', true);
                    }
                },
                error : err => {
                    alerts.notify(err.responseText, 'Error', 'error', true);;
                }
            });
        }
    })
});

function updateBalance(balance, reload) {
    var balanceType = '';
    if(getCookie("settings_dongers") == 'true') {
        balance = parseFloat((balance / 1000).toFixed(4));
        balanceType = '$';
    }
    if(reload) {
        $('#balance_r, #balance_p').fadeOut(100).html(balance).fadeIn(100);
    } else {
        $('#balance_r, #balance_p').countTo(balance, {
            'color': true
        });
    }
    $('.balance_type').html(balanceType);
    
}


$(document).on('click', '.betting_event_unit', function()  {
    var id = $(this).attr('matchid');
    getMatch(id);
})
     
