$(function() {
    json()
})

function json() {
    let page = 1
    let end = 16
    let arr = ""
    let keyword = "" 
    const canvas = $('#wordcloud')[0]
    const ctx = canvas.getContext('2d')
    
    $.getJSON('./resources/json/keywords.json', function(data) {
        arr = data.data.sort((a,b) => b.frequency - a.frequency)
        arr = arr.map((item) => {
            item.color = random()
            return item
        })

        function random() {
            let hex = "#"
            let color = "1234567890ABCDEF"
            for(i=0; i<6; i++) {
                hex += color[Math.floor(Math.random() * color.length)]
            }
    
            let findColor = arr.filter(item => hex.includes(item.color))
            if(findColor.length) random()

            return hex
        }
        keyword = arr

        setting()
        ev()
        wordcloud()
        chart()
    })

    function ev() {
        $(document).on('change', '.table input', function() {
            let check = []
            $('.table input:checked').each((idx, item) => {
                check.push($(item).attr('idx'))
            })

            keyword = arr.filter(item => check.includes(item.word))
            if($('.table input:checked').length < 15) {
                alert("최소 15개 이상 선택되어야 합니다")
                $(this).prop('checked', true)
            }
            wordcloud()
            chart()
        })

        wordcloud()
    }

    function setting() {
        arr.forEach((item) => {
            $('.table tbody').append(`
                <tr>
                    <td><input type="checkbox" idx='${item.word}' style='background-color: ${item.color};' checked></td>            
                    <td style='color:${item.color};'>${item.word}</td>            
                    <td style='color:${item.color};'>${item.frequency}</td>            
                </tr>
            `)
        })
    }

    function wordcloud() {
        let placeArr = []
        ctx.clearRect(0,0, canvas.width, canvas.height)
        let font = 64
        keyword.forEach(item => {
            let angle = 0
            let radius = 0
            let len = 300
            let place = false  

            ctx.font = `${font}px Malgun Gothic`
            ctx.textBaseline = 'middle'
            ctx.textAlign = 'center'
            ctx.fillStyle = item.color

            while(!place) {
                const x = len + radius * Math.cos(angle)
                const y = len + radius * Math.sin(angle)

                const me = ctx.measureText(item.word)
                const width = me.width
                const height = font 

                const offsetX = width / 2 
                const offsetY = height / 2 
                
                const collding = iscollding(x - offsetX, y - offsetY, width, height, placeArr, font)
                if(!collding) {
                    ctx.fillText(item.word, x, y)
                    placeArr.push({word:item.word, x:x, y:y, width:width, height:height, offsetX:offsetX, offsetY:offsetY, font:font, frequency:item.frequency})
                    place = true
                } else {
                    angle += 0.1
                    radius += 0.02
                }
            }
            
            font -= 2
        })

        $('#wordcloud').mousemove(function(e) {
            const mouseX = e.offsetX
            const mouseY = e.offsetY
            let hover = ""
            $('.sub2-2 .block').remove()
            placeArr.forEach(item => {
                // 시작점
                const x = item.x - item.offsetX 
                const y = item.y - item.offsetY

                if(
                    x <= mouseX &&
                    mouseX <= x + item.width &&
                    y <= mouseY && 
                    mouseY <= y + item.height
                ) {
                    hover = item
                    if(hover) {
                        $('.sub2-2 .col-6:nth-child(2)').append(`
                            <div class='block poa text-center' style='top: ${hover.y - 80}px; left: ${hover.x - 50}px;'>
                                <p class='fff mb-0'>${hover.frequency}</p>                        
                                <p class='fff'>${hover.font}px</p>                        
                            </div>
                        `)
                    }
                }
            })
        })
    }

    function iscollding(x, y, width, height, placeArr, font) {
        const padding = font < 25 ? 10 : 1
        for(let i=0; i<placeArr.length; i++) {
            const word = placeArr[i]
            const wordX = word.x - word.width / 2
            const wordY = word.y - word.height / 2
            if(
                x < wordX + word.width + padding && 
                x + width > wordX - padding && 
                y < wordY + word.height + padding &&
                y + height > wordY - padding 
            ) {
                return true
            }
        } 
        return false
    }

    $('.next').on('click', function() {
        page++
        end++
        chart()
    })

    $('.prev').on('click', function() {
        page--
        end--
        chart()
    })

    function chart() {
        if(page == 1) {
            $('.prev').css('visibility', 'hidden')
        } else if(page) {
            $('.prev').css('visibility', 'visible')
        }
        console.log(end, keyword.length)
        if(end == keyword.length) {
            $('.next').css('visibility', 'hidden')
        } else {
            $('.next').css('visibility', 'visible')
        }
  
        let frequency = []
        let word = []
        let itemArr = []
        keyword.slice(page -1, end -1).forEach(item => {
            frequency.push(item.frequency)
            word.push(item.word)
            itemArr.push(item)
        })

        let max = Math.max(...frequency)
        max = Math.floor(max / 100) * 100
        $('.y p').text(max)
        
        itemArr.forEach((item, index) => {
            const percentage = (item.frequency / max) * 100
            $('.chart > div .hover').eq(index).text(item.frequency)

            $('.x p').eq(index).text(item.word).css('color', `${item.color}`)
            const bar = $('.chart > div').eq(index).css({
                height: '0%',
                background: item.color,
                transition: 'height 1s ease-out'
            }).addClass('por').attr('frequency', item.frequency)

            setTimeout(() => {
                bar.css('height', `${percentage}%`)
            }, 50)
        })
    }
}