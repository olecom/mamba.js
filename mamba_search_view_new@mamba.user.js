// ==UserScript==
// @name            Mamba search view new
// @author          olecom
// @namespace       mamba
// @description     Hides viewed persons on search pages. Any char key will mark items as "no interest" and load next page if any. Clicked items will be not marked as "no interest". Click on paginator will not do marking. Also top user bar has additional buttons. Supports: Mozilla Firefox and Google Chrome. Some code is taken from "Mamba search" by ikarta.
// @match           http://www.mamba.ru/*
// @match           http://www.mamba.ru/*/*
// @match           http://love.mail.ru/*
// @match           http://love.mail.ru/*/*
// @version         0.3
// ==/UserScript==

function uglify_js(w ,d){
    w.addEventListener('DOMContentLoaded', on_load, true)
    w.addEventListener('load', on_load, true)

    function on_load(){
        var a ,ul ,el ,di ,oid ,i ,j ,f
        
        w.removeEventListener('DOMContentLoaded', on_load, true)
        w.removeEventListener('load', on_load, true)

        // add buttons: forget, auto next, next
        try {
            a = d.getElementsByClassName("ui-usermenu-left")[0]
        } catch(e) { return console.log(e) }
        el = d.createElement("li") ,el.setAttribute("class", "ui-usermenu-delimiter")
        a.appendChild(el)
// forget button on anketa/user page
        if(w.location.href.match(/anketa/) || !w.location.href.match(/search[.]phtm/)){
            el = d.createElement("li") ,el.setAttribute("class", "ui-usermenu-item")
            di = d.createElement("a") ,di.setAttribute("class", "item")
            di.style.cursor = 'pointer'
            di.innerHTML = 'Забыть анкету'
            di.onclick = function(){
                var id = document.getElementsByClassName("mb5 fl-l")[0].innerHTML.replace(/ID: ([^,]*),.*/,'$1')
                localStorage[id] = '-'// console.log('forgot: ' + id)
            }
            return el.appendChild(di) ,a.appendChild(el)
        }
// autonext button
        el = d.createElement("li") ,el.setAttribute("class", "ui-usermenu-item")
        di = d.createElement("a") ,di.setAttribute("class", "item")
        di.innerHTML = localStorage['anext'] ? '<b>Само</b> дальше' : 'Само дальше'
        di.style.cursor = 'pointer'
        di.onclick = function(){
            localStorage['anext'] = localStorage['anext'] ? '' : '+'
        }
        el.appendChild(di) ,a.appendChild(el)
// next button
        el = d.createElement("li") ,el.setAttribute("class", "ui-usermenu-delimiter")
        a.appendChild(el)
        el = d.createElement("li") ,el.setAttribute("class", "ui-usermenu-item")
        di = d.createElement("a") ,di.setAttribute("class", "item")
        di.innerHTML = 'Дальше' ,di.style.cursor = 'pointer'
        di.onclick = on_keydown
        el.appendChild(di) ,a.appendChild(el)

        // scan and fade away items of "no interest"
        j = 0 ,ul = d.getElementsByClassName('MainBlockRightSearch')[0].children[0]
        w.scroll(0, 256) ,f = false

        for(i = 0; i < ul.childElementCount; i++){
/*  <ul><li[i]>                         | children[i]
    <div class="opacity>                | children[0]
        <div class="sr-ico-count"/>
        <div class="u-m-photo u-photo"> | children[1]
            <a href="http://www.mamba.ru/anketa.phtml?oid=0123456789&hit=10&fromsearch&sp=14">
                                        | children[0]  RE=^^^^^^^^^^
                <img>                   | children[0]
            </a>
        </div>
        ...
    </div></li[i]>
    ...
    </ul>  */
            a = ul.children[i].children[0].children[1].children[0]
            oid = a.href.replace(/.*oid=([^&]*).*/ ,'$1')
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
                el.onclick = function(id ,a ,el){ return function(){
                     localStorage[id] = '-'
                     a.style.opacity = a.children[0].style.opacity = 0.4
                     el.innerHTML = ''
                }}(oid ,a ,el)
                a.parentNode.appendChild(el)
                if(!f) a.scrollIntoView(true) ,f = true// scroll to the first item
            }
            a.onmousedown = function(){// for marked and yet not marked items
                var t = this.href.replace(/.*oid=([^&]*).*/ ,'$1')
                localStorage[t] = '' // save or restore "interest"
                console.log('clear:' + t)
                this.style.opacity = this.children[0].style.opacity = 1
                this.onmousedown = this.onmouseover = this.onmouseout = function(){}
            }
        }//for{}

        if(j === ul.childElementCount){// nothing to look at
            if(w.localStorage['anext']){
                setTimeout(on_keydown ,1024)// give some time for action
            } else w.scroll(0, 99999)
        }
        w.addEventListener('keypress', on_keydown, true)
        function on_keydown(ev){
            for(i = 0; i < ul.childElementCount; i++){// scan and save "no interest"
                a = ul.children[i].children[0].children[1].children[0]
                oid = a.href.replace(/.*oid=([^&]*).*/ ,'$1')
                if(w.localStorage[oid] === undefined){
                    w.localStorage[oid] = '-' // save "no interest"
                }
            }
            // direct calls and/or event handling
            if((!ev || !ev.charCode) ||
               (ev && ev.charCode && ev.charCode != 32 && (ev.charCode < 48 || ev.charCode > 57))) try {
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

uglify_js(window ,document)
