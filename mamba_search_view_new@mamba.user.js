// ==UserScript==
// @name            Mamba search view new
// @author          olecom
// @namespace       mamba
// @description     Улучшенный поиск и фильтрация несимпатичных фотографий без рекламы
// @match           http://www.mamba.ru/*
// @match           http://www.mamba.ru/*/*
// @match           http://love.mail.ru/*
// @match           http://love.mail.ru/*/*
// @version         0.4
// ==/UserScript==

function uglify_js(w ,d ,con){
    var j ,el

    w.addEventListener('load', on_load, true)
    j = setTimeout(on_load, 1234)

    try {// remove ads
        rm_class("MainBlockContainer", "MainBlockLeft")
        rm_class("MainBlockRight", "mordolenta")
    } catch(e){}

    try {// fix Firefox.noscript issue
        el = d.createElement("div"), el.setAttribute("id", "banner_xgemius")
        d.children[0].appendChild(el)
        el = null
    } catch(e){}

    return true

    function rm_class(p, c){
        d.getElementsByClassName(p)[0].removeChild(d.getElementsByClassName(c)[0])
    }

    function on_load(){
        var a ,ul ,oid ,i ,f
           ,dev = !!con && !true// development/debug mode

        clearTimeout(j)
        w.removeEventListener('load', on_load, true)

if(dev) con.log('hi')

        // add buttons: forget, auto next, next
        try {
            a = d.getElementsByClassName("ui-userbar-empty")[0]
            if(!a){
                a = d.getElementsByClassName("lang-selector")[0]
                if(!a) return con.warn('No "ui-userbar-empty" or "lang-selector" found!')
            }
        } catch(e){
            con.log('Error: "ui-userbar-empty" or "lang-selector"')
            return con.dir(e)
        }

// forget button on anketa/user page
        if(w.location.href.match(/fromsearch/) || !w.location.href.match(/search[.]phtm/)){
            rm_class('anketa_bottom', 'b-people__similar')// remove ads
if(dev) con.log('anketa')

            for(i = 0, el = d.getElementsByClassName("b-anketa_inset-form"); i < el.length; i++){
                if(/см/.test(el[i].innerHTML)){// human height
                    oid = el[i].innerHTML.match(/[^><]* см/)[0]
                    break
                }
            }

            el = d.createElement("div") ,el.setAttribute("class", "btn-group-item")
            el.innerHTML = '<div class="inset" style="color: red">' + (oid ? oid : '') +
' Забыть анкету</div>' +
                           '<div style="min-width: 280px;" class="baloon tl show-hover baloon-with-close ">' +
                           '<div class="make-top-noprocess-block">' +
'Скрыть анкету в поиске; не понравилась' +
                           '</div></div>'

            el.onclick = function forget_item(){
                var id

                if(!/[/]mb[\d]*[?]/.test(w.location.href)){//text ID from URL
                // URL examples with text ID:
                // http://www.mamba.ru/mega_baba
                // http://www.mamba.ru/mega_baba?hit=10&fromsearch&sp=4
                // http://www.mamba.ru/mega_baba/albums?sp=4
                // http://www.mamba.ru/mega_baba/album_photos?album_id=1170973545&#closed
                // RE gets this part:  ^^^^^^^^^
                    id = w.location.href.replace(/http[s]*:[/][/][^/]*[/]([^/?]*).*$/ ,'$1')
                } else {//numeric ID on page
                    id = d.getElementsByClassName("mb5 fl-l")[0].innerHTML
                          .replace(/ID: ([^,]*),.*$/,'$1')
                }
if(dev) con.log('forgetting "' + id + '": ' + localStorage[id])
                localStorage[id] = '-'
                this.innerHTML = ''
            }
            return a.parentElement.insertBefore(el, a)
        }
// autonext button
if(dev) con.log('searching')
        el = d.createElement("div") ,el.setAttribute("class", "btn-group-item")
        el.innerHTML = '<div class="inset" style="color: red">' +
                       (localStorage['anext'] ?
'<b>Само</b> дальше идёт' :
'Само дальше включить') +
                       '</div><div style="min-width: 280px;" class="baloon tl show-hover baloon-with-close ">' +
                       '<div class="make-top-noprocess-block">' +
'Автоматически перейти на следующую, если на странице нет "новых" анкет' +
                       '</div></div>'
        el.onclick = function automatic_next_page(){
            var an = !localStorage['anext']
            localStorage['anext'] = an ? '+' : ''
            this.innerHTML = '<div class="inset">' + (an ?
'<b>Само</b> дальше идёт' :
'Само дальше включить') + '</div>'
if(dev) con.log('automatic next page: ' + (an ? 'yes' : 'no'))
            on_keydown()
        }
        a.parentElement.insertBefore(el, a)

// next button
        el = d.createElement("div") ,el.setAttribute("class", "btn-group-item")
        el.innerHTML = '<div class="inset" style="color: red">Дальше</div>' +
                       '<div style="min-width: 280px;" class="baloon tl show-hover baloon-with-close ">' +
                       '<div class="make-top-noprocess-block">' +
'Перейти на следующую страницу, пометить все фотки (кроме выбраных) как безынтересные<br><br>' +
'Клавиши кроме <b>[0]</b>-<b>[9]</b>, <b>[пробел]</b>, <b>[ввод]</b>, эквивалентны нажатию этой кнопки<br><br>' +
'Переход на следущую страницу через обычную листалку (снизу) ничего не помечает' +
                       '</div></div>'
        el.onclick = on_keydown
        a.parentElement.insertBefore(el, a)

        // scan and fade away items of "no interest"
        try {
            d.getElementsByClassName('MainBlockRight')[0].style.width = '100%'// some style
            ul = d.getElementsByClassName('MainBlockRightSearch')[0].children[0]
            if(!ul) return con.warn('No "MainBlockRightSearch" found!')
        } catch(e){ return con.log("MainBlockRightSearch"), con.dir(e) }

        w.scroll(0, 237)

        j = 0 ,f = false
        for(i = 0; i < ul.childElementCount; i++){
/*  <ul><li[i]>                         | children[i]
    <div class="opacity>                | children[0]
        <div class="sr-ico-count"/>
        <div class="u-m-photo u-photo"> | children[1]
            <a href="http://www.mamba.ru/anketa.phtml?oid=0123456789&hit=10&fromsearch&sp=14">
                                        | children[0]  RE=^^^^^^^^^^
                     http://www.mamba.ru/mb0123456789?hit=10&fromsearch&sp=1
                                        RE=^^^^^^^^^^
                <img>                   | children[0]
            </a>
        </div>
        ...
    </div></li[i]>
    ...
    </ul>  */
            a = ul.children[i]
            a.style.width = '33%' ,a.style.margin = '0'// some style
            a.children[0].style['min-height'] = '168px'// some style
            a = a.children[0].children[1].children[0]
            if(/oid=/.test(a.href)){
                oid = a.href.replace(/.*oid=([^&]*).*$/ ,'$1')
            } else if(/[/]mb[\d]*[?]/.test(a.href)){
                oid = a.href.replace(/.*[/]mb([^?]*).*$/ ,'$1')
            } else {
                oid = a.href.replace(/.*[/]([^?]*).*$/ ,'$1')
            }
if(dev) con.log('id search: ' + oid)
            if(w.localStorage[oid] === '-'){
                j += 1
                a.style.opacity = a.children[0].style.opacity = 0.4
                a.onmouseover = function(){
                    this.style.opacity = this.children[0].style.opacity = 1
                }
                a.onmouseout = function(){
                    this.style.opacity = this.children[0].style.opacity = 0.4
                }
            } else {// forget inline
                el = d.createElement("a")
                el.innerHTML = 'Забыть'
                el.style.cursor = 'crosshair',el.style.color = 'red'
                el.onclick = function(id ,a ,el){ return function(){
if(dev) con.log('forgetting "' + id + '": ' + localStorage[id])
                     localStorage[id] = '-'
                     a.style.opacity = a.children[0].style.opacity = 0.4
                     el.innerHTML = ''
                }}(oid ,a ,el)
                a.parentNode.appendChild(el)
                if(!f) a.scrollIntoView(true) ,f = true// scroll to the first item
            }
            a.onmousedown = function(){// for marked and yet not marked items
                var t
                if(/oid=/.test(this.href)){
                    t = this.href.replace(/.*oid=([^&]*).*$/ ,'$1')
                } else if(/[/]mb[\d]*[?]/.test(this.href)){
                    t = this.href.replace(/.*[/]mb([^?]*).*$/ ,'$1')
                } else {
                    t = this.href.replace(/.*[/]([^?]*).*$/ ,'$1')
                }
if(dev) con.log('id clear: ' + t)

                localStorage[t] = '' // save or restore "interest"
                this.style.opacity = this.children[0].style.opacity = 1
                this.onmousedown = this.onmouseover = this.onmouseout = function(){}
            }
        }//for{}
if(dev && !j) con.log('all items in view')

        if(j === ul.childElementCount){// nothing to look at
            if(w.localStorage['anext']){
                setTimeout(on_keydown ,2048)// give some time for switch off action
            } else w.scroll(0, 99999)
        }
        w.addEventListener('keypress', on_keydown, true)

        return true

        function on_keydown(ev){
            for(i = 0; i < ul.childElementCount; i++){// scan and save "no interest"
                a = ul.children[i].children[0].children[1].children[0]
                if(/oid=/.test(a.href)){
                    oid = a.href.replace(/.*oid=([^&]*).*$/ ,'$1')
                } else if(/[/]mb[\d]*[?]/.test(a.href)){
                    oid = a.href.replace(/.*[/]mb([^?]*).*$/ ,'$1')
                } else {
                    oid = a.href.replace(/.*[/]([^?]*).*$/ ,'$1')
                }
if(dev) con.log('id n: ' + oid)
                if(w.localStorage[oid] === undefined){
                    w.localStorage[oid] = '-' // save "no interest"
                }
            }
            // direct calls and/or event handling
            if((!ev || !ev.charCode) ||
               (ev && ev.charCode && ev.charCode != 32 && (ev.charCode < 48 || ev.charCode > 57))
            ) try {
                if (ev && 13 == ev.keyCode) return// Enter,
                // space and numbers are normal keys
                // any other key will load next page if there is one
                w.location.href = d.getElementById("Paginator")
                    .getElementsByClassName('selected')[0]
                        .nextSibling.nextSibling.children[0].href
            } catch(e){
                localStorage['anext'] = '' // clear autonext, load the first page
                w.location = d.getElementById("Paginator").children[0].children[0].href
            }
        }
    }// on_load()
}

uglify_js(window ,document ,console)
