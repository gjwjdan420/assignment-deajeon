$(function() {
    save()
    hot()
})

let saveArr = []
let count = 1
function save() {
    isit = JSON.parse(localStorage.getItem('saveArr'))
    if(isit != []) {
        saveArr = isit
        if(saveArr.length > 1) {
            count = saveArr[saveArr.length - 1].count
        }
    }
}

function hot() {
    let arr = ""
    let dir = ""
    let name = ""

    let saveX = ""
    let saveY = ""
    let downX = ""
    let downY = ""

    $.getJSON('./resources/json/hot.json', function(data) {
        arr = data.imgs
        dir = data.imgdir
        arr = arr.map(item => {
                item.map = item.name.replace(".jpg", "")
                return item
            })

        name = arr[0].map

        setting()
        map()
        ev()
    })

    function setting() {
        arr.forEach(item => {
            $('.list').append(`
                <div name='${item.map}' style='background-image: url(./resources/B/${dir}${item.name});'>    
            `)
        })
    }

    let drag = false
    let dragIn = false

    function ev() {
        $(document).on('click', '.animation', function() {
            const count = $(this).attr('count')
            let move = saveArr.find(item => item.count == count)
        })
        // 382.5, 300
        $(document).on('click', '.delete', function() {
            const count = $(this).attr('count')
            saveArr = saveArr.filter(item => item.count != count)
            localStorage.setItem('saveArr', JSON.stringify(saveArr))
            memo()
        })

        $('.list > div').click(function() {
            name = $(this).attr('name')
            map()
        })

        $('.box2').mousedown(function(e) {
            downX = e.clientX
            downY = e.clientY
            drag = true
            e.preventDefault()
        })

        $('.box2').mousemove(function(e) {
            dragIn = true
            if(drag) {
                const cliX = e.clientX
                const cliY = e.clientY
                
                saveX -= (cliX - downX) * 0.2
                saveY -= -(cliY - downY) * 0.2
                $('.view-box').css('transform', `rotateX(${saveY}deg) rotateY(${saveX}deg)`)
                downX = cliX
                downY = cliY

                pinMove()
            }
            e.preventDefault()
        })

        $('.box2').mouseup(function() {
            drag = false
        })

        let spot = false
        $('.spot').on('dragstart', function() {
            let title = $('#sub2-title').val()
            let content = $('#sub2-content').val()
            if(title == "" && content == "") {
                alert("핫플명과 내용을 입력해주셔야 spot을 등록을 할 수 있습니다")
                spot = false 
            } else {
                spot = true
            }
        })

        $('body').on('wheel', function() {
            dragIn = false
        })

        let scale = 1
        $('.box2').on('wheel', function(e) {
            if(dragIn) {
                e.preventDefault()
                e.stopPropagation()
                if(e.originalEvent.deltaY > 0) {
                    if(scale > 0.7) {scale -= 0.05}
                } else {
                    if(scale < 2) {scale += 0.05}
                }

                $('.view').css('transform', `scale(${scale})`)
                pinMove()
            }
        })

        $('.position').mousemove(function(e) {
            let title = $('#sub2-title').val()
            let content = $('#sub2-content').val()
            if(spot && title != "" && content != "") {
                let page = $(this).attr('position')
                let x = e.offsetX
                let y = e.offsetY

                count++
                $(this).append(`<div class='poa poi ${page}-${count}-${name}' name='${name}' idx='${count}' page='${page}' style='left: ${x}px; top: ${y}px;'>`)
                let offsetX = $(`.${page}-${count}-${name}`).offset().left
                let offsetY = $(`.${page}-${count}-${name}`).offset().top

                let pinX = offsetX - $('.box2').offset().left
                let pinY = offsetY - $('.box2').offset().top
                saveArr.push({
                    x: x,
                    y: y,
                    name: name,
                    count: count,
                    page: page,
                    pinX : pinX,
                    pinY : pinY,
                    content:content,
                    title:title,
                })

                localStorage.setItem('saveArr', JSON.stringify(saveArr))

                memo()

                $('#sub2-title').val("")
                $('#sub2-content').val("")
                spot = false
            } 
        })
    }

    function pinMove() {
        $('.pin').each((idx,item) => {
            const names = $(item).attr('name')
            const idxs = $(item).attr('idx')
            const pages = $(item).attr('page')
            const poi = $(`.poi.${pages}-${idxs}-${names}`)
            const poX = poi.offset().left
            const poY = poi.offset().top
            const totalX = poX - $('.box2').offset().left
            const totalY = poY - $('.box2').offset().top

            $(item).css({
                'top' : `${totalY}px`,
                'left' : `${totalX}px`
            })
        })
    }

    function map() {
        $('.place-tit').text(name)
        let change = arr.find(item => item.map == name)
        $('.view-box > div').each((idx, item) => {
            $(item).css('background-image', `url(./resources/B/${dir}${change.name})`)
            memo()
        })
    }

    function memo() {
        $('.poi').remove()
        $('.pin').remove()
        $('.box3 .df').remove()
        saveArr.forEach(item => {
            if(item.name == name) { 
                $('.box3').append(`
                    <div class='df px-4 jb'>
                        <p class='animation' count='${item.count}' link='${item.page}-${item.count}-${item.name}'>${item.title}</p>
                        <button class='button2 btn2 delete' count='${item.count}' style='width: 50px;' link='${item.page}-${item.count}-${item.name}'>삭제</button>
                    </div>
                `)

                $(`.${item.page}`).append(
                    `<div class='poa poi ${item.page}-${item.count}-${item.name}' name='${item.name}' idx='${item.count}' page='${item.page}' style='left: ${item.x}px; top: ${item.y}px;'>`
                )

                $('.box2').append(`
                    <div class='poa pin ${item.page}-${item.count}-${item.name}' name='${item.name}' idx='${item.count}' page='${item.page}' style='left:${item.pinX}px; top:${item.pinY}px;'>
                        <img src='./resources/B/spot.png'>
                        <div class='bind poa'>
                            <p class='mb-0'>${item.title}</p>
                            <p>${item.content}</p>
                        </div>
                    </div>
                `)
            }
            pinMove()
        })
    }
}