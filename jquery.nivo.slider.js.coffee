#  jQuery Nivo Slider v3.2
#  http://nivo.dev7studios.com
# 
#  Copyright 2012, Dev7studios
#  Free to use and abuse under the MIT license.
#  http://www.opensource.org/licenses/mit-license.php

(($) ->
  NivoSlider = (element, options) ->
    
    # Defaults are below
    settings = $.extend({}, $.fn.nivoSlider.defaults, options)
    
    # Useful variables. Play carefully.
    vars =
      currentSlide: 0
      currentImage: ""
      totalSlides: 0
      running: false
      paused: false
      stop: false
      controlNavEl: false

    
    # Get this slider
    slider = $(element)
    slider.data("nivo:vars", vars).addClass "nivoSlider"
    
    # Find our slider children
    kids = slider.children()
    kids.each ->
      child = $(this)
      link = ""
      unless child.is("img")
        if child.is("a")
          child.addClass "nivo-imageLink"
          link = child
        child = child.find("img:first")
      
      # Get img width & height
      childWidth = (if (childWidth is 0) then child.attr("width") else child.width())
      childHeight = (if (childHeight is 0) then child.attr("height") else child.height())
      link.css "display", "none"  if link isnt ""
      child.css "display", "none"
      vars.totalSlides++

    
    # If randomStart
    settings.startSlide = Math.floor(Math.random() * vars.totalSlides)  if settings.randomStart
    
    # Set startSlide
    if settings.startSlide > 0
      settings.startSlide = vars.totalSlides - 1  if settings.startSlide >= vars.totalSlides
      vars.currentSlide = settings.startSlide
    
    # Get initial image
    if $(kids[vars.currentSlide]).is("img")
      vars.currentImage = $(kids[vars.currentSlide])
    else
      vars.currentImage = $(kids[vars.currentSlide]).find("img:first")
    
    # Show initial link
    $(kids[vars.currentSlide]).css "display", "block"  if $(kids[vars.currentSlide]).is("a")
    
    # Set first background
    sliderImg = $("<img/>").addClass("nivo-main-image")
    sliderImg.attr("src", vars.currentImage.attr("src")).show()
    slider.append sliderImg
    
    # Detect Window Resize
    $(window).resize ->
      slider.children("img").width slider.width()
      sliderImg.attr "src", vars.currentImage.attr("src")
      sliderImg.stop().height "auto"
      $(".nivo-slice").remove()
      $(".nivo-box").remove()

    
    #Create caption
    slider.append $("<div class=\"nivo-caption\"></div>")
    
    # Process caption function
    processCaption = (settings) ->
      nivoCaption = $(".nivo-caption", slider)
      if vars.currentImage.attr("title") isnt "" and vars.currentImage.attr("title") isnt `undefined`
        title = vars.currentImage.attr("title")
        title = $(title).html()  if title.substr(0, 1) is "#"
        if nivoCaption.css("display") is "block"
          setTimeout (->
            nivoCaption.html title
          ), settings.animSpeed
        else
          nivoCaption.html title
          nivoCaption.stop().fadeIn settings.animSpeed
      else
        nivoCaption.stop().fadeOut settings.animSpeed

    
    #Process initial  caption
    processCaption settings
    
    # In the words of Super Mario "let's a go!"
    timer = 0
    if not settings.manualAdvance and kids.length > 1
      timer = setInterval(->
        nivoRun slider, kids, settings, false
      , settings.pauseTime)
    
    # Add Direction nav
    if settings.directionNav
      slider.append "<div class=\"nivo-directionNav\"><a class=\"nivo-prevNav\">" + settings.prevText + "</a><a class=\"nivo-nextNav\">" + settings.nextText + "</a></div>"
      $(slider).on "click", "a.nivo-prevNav", ->
        return false  if vars.running
        clearInterval timer
        timer = ""
        vars.currentSlide -= 2
        nivoRun slider, kids, settings, "prev"

      $(slider).on "click", "a.nivo-nextNav", ->
        return false  if vars.running
        clearInterval timer
        timer = ""
        nivoRun slider, kids, settings, "next"

    
    # Add Control nav
    if settings.controlNav
      vars.controlNavEl = $("<div class=\"nivo-controlNav\"></div>")
      slider.after vars.controlNavEl
      i = 0

      while i < kids.length
        if settings.controlNavThumbs
          vars.controlNavEl.addClass "nivo-thumbs-enabled"
          child = kids.eq(i)
          child = child.find("img:first")  unless child.is("img")
          vars.controlNavEl.append "<a class=\"nivo-control\" rel=\"" + i + "\"><img src=\"" + child.attr("data-thumb") + "\" alt=\"\" /></a>"  if child.attr("data-thumb")
        else
          vars.controlNavEl.append "<a class=\"nivo-control\" rel=\"" + i + "\">" + (i + 1) + "</a>"
        i++
      
      #Set initial active link
      $("a:eq(" + vars.currentSlide + ")", vars.controlNavEl).addClass "active"
      $("a", vars.controlNavEl).bind "click", ->
        return false  if vars.running
        return false  if $(this).hasClass("active")
        clearInterval timer
        timer = ""
        sliderImg.attr "src", vars.currentImage.attr("src")
        vars.currentSlide = $(this).attr("rel") - 1
        nivoRun slider, kids, settings, "control"

    
    #For pauseOnHover setting
    if settings.pauseOnHover
      slider.hover (->
        vars.paused = true
        clearInterval timer
        timer = ""
      ), ->
        vars.paused = false
        
        # Restart the timer
        if timer is "" and not settings.manualAdvance
          timer = setInterval(->
            nivoRun slider, kids, settings, false
          , settings.pauseTime)

    
    # Event when Animation finishes
    slider.bind "nivo:animFinished", ->
      sliderImg.attr "src", vars.currentImage.attr("src")
      vars.running = false
      
      # Hide child links
      $(kids).each ->
        $(this).css "display", "none"  if $(this).is("a")

      
      # Show current link
      $(kids[vars.currentSlide]).css "display", "block"  if $(kids[vars.currentSlide]).is("a")
      
      # Restart the timer
      if timer is "" and not vars.paused and not settings.manualAdvance
        timer = setInterval(->
          nivoRun slider, kids, settings, false
        , settings.pauseTime)
      
      # Trigger the afterChange callback
      settings.afterChange.call this

    
    # Add slices for slice animations
    createSlices = (slider, settings, vars) ->
      $(vars.currentImage).parent().css "display", "block"  if $(vars.currentImage).parent().is("a")
      $("img[src=\"" + vars.currentImage.attr("src") + "\"]", slider).not(".nivo-main-image,.nivo-control img").width(slider.width()).css("visibility", "hidden").show()
      sliceHeight = (if ($("img[src=\"" + vars.currentImage.attr("src") + "\"]", slider).not(".nivo-main-image,.nivo-control img").parent().is("a")) then $("img[src=\"" + vars.currentImage.attr("src") + "\"]", slider).not(".nivo-main-image,.nivo-control img").parent().height() else $("img[src=\"" + vars.currentImage.attr("src") + "\"]", slider).not(".nivo-main-image,.nivo-control img").height())
      i = 0

      while i < settings.slices
        sliceWidth = Math.round(slider.width() / settings.slices)
        if i is settings.slices - 1
          slider.append $("<div class=\"nivo-slice\" name=\"" + i + "\"><img src=\"" + vars.currentImage.attr("src") + "\" style=\"position:absolute; width:" + slider.width() + "px; height:auto; display:block !important; top:0; left:-" + ((sliceWidth + (i * sliceWidth)) - sliceWidth) + "px;\" /></div>").css(
            left: (sliceWidth * i) + "px"
            width: (slider.width() - (sliceWidth * i)) + "px"
            height: sliceHeight + "px"
            opacity: "0"
            overflow: "hidden"
          )
        else
          slider.append $("<div class=\"nivo-slice\" name=\"" + i + "\"><img src=\"" + vars.currentImage.attr("src") + "\" style=\"position:absolute; width:" + slider.width() + "px; height:auto; display:block !important; top:0; left:-" + ((sliceWidth + (i * sliceWidth)) - sliceWidth) + "px;\" /></div>").css(
            left: (sliceWidth * i) + "px"
            width: sliceWidth + "px"
            height: sliceHeight + "px"
            opacity: "0"
            overflow: "hidden"
          )
        i++
      $(".nivo-slice", slider).height sliceHeight
      sliderImg.stop().animate
        height: $(vars.currentImage).height()
      , settings.animSpeed

    
    # Add boxes for box animations
    createBoxes = (slider, settings, vars) ->
      $(vars.currentImage).parent().css "display", "block"  if $(vars.currentImage).parent().is("a")
      $("img[src=\"" + vars.currentImage.attr("src") + "\"]", slider).not(".nivo-main-image,.nivo-control img").width(slider.width()).css("visibility", "hidden").show()
      boxWidth = Math.round(slider.width() / settings.boxCols)
      boxHeight = Math.round($("img[src=\"" + vars.currentImage.attr("src") + "\"]", slider).not(".nivo-main-image,.nivo-control img").height() / settings.boxRows)
      rows = 0

      while rows < settings.boxRows
        cols = 0

        while cols < settings.boxCols
          if cols is settings.boxCols - 1
            slider.append $("<div class=\"nivo-box\" name=\"" + cols + "\" rel=\"" + rows + "\"><img src=\"" + vars.currentImage.attr("src") + "\" style=\"position:absolute; width:" + slider.width() + "px; height:auto; display:block; top:-" + (boxHeight * rows) + "px; left:-" + (boxWidth * cols) + "px;\" /></div>").css(
              opacity: 0
              left: (boxWidth * cols) + "px"
              top: (boxHeight * rows) + "px"
              width: (slider.width() - (boxWidth * cols)) + "px"
            )
            $(".nivo-box[name=\"" + cols + "\"]", slider).height $(".nivo-box[name=\"" + cols + "\"] img", slider).height() + "px"
          else
            slider.append $("<div class=\"nivo-box\" name=\"" + cols + "\" rel=\"" + rows + "\"><img src=\"" + vars.currentImage.attr("src") + "\" style=\"position:absolute; width:" + slider.width() + "px; height:auto; display:block; top:-" + (boxHeight * rows) + "px; left:-" + (boxWidth * cols) + "px;\" /></div>").css(
              opacity: 0
              left: (boxWidth * cols) + "px"
              top: (boxHeight * rows) + "px"
              width: boxWidth + "px"
            )
            $(".nivo-box[name=\"" + cols + "\"]", slider).height $(".nivo-box[name=\"" + cols + "\"] img", slider).height() + "px"
          cols++
        rows++
      sliderImg.stop().animate
        height: $(vars.currentImage).height()
      , settings.animSpeed

    
    # Private run method
    nivoRun = (slider, kids, settings, nudge) ->
      
      # Get our vars
      vars = slider.data("nivo:vars")
      
      # Trigger the lastSlide callback
      settings.lastSlide.call this  if vars and (vars.currentSlide is vars.totalSlides - 1)
      
      # Stop
      return false  if (not vars or vars.stop) and not nudge
      
      # Trigger the beforeChange callback
      settings.beforeChange.call this
      
      # Set current background before change
      unless nudge
        sliderImg.attr "src", vars.currentImage.attr("src")
      else
        sliderImg.attr "src", vars.currentImage.attr("src")  if nudge is "prev"
        sliderImg.attr "src", vars.currentImage.attr("src")  if nudge is "next"
      vars.currentSlide++
      
      # Trigger the slideshowEnd callback
      if vars.currentSlide is vars.totalSlides
        vars.currentSlide = 0
        settings.slideshowEnd.call this
      vars.currentSlide = (vars.totalSlides - 1)  if vars.currentSlide < 0
      
      # Set vars.currentImage
      if $(kids[vars.currentSlide]).is("img")
        vars.currentImage = $(kids[vars.currentSlide])
      else
        vars.currentImage = $(kids[vars.currentSlide]).find("img:first")
      
      # Set active links
      if settings.controlNav
        $("a", vars.controlNavEl).removeClass "active"
        $("a:eq(" + vars.currentSlide + ")", vars.controlNavEl).addClass "active"
      
      # Process caption
      processCaption settings
      
      # Remove any slices from last transition
      $(".nivo-slice", slider).remove()
      
      # Remove any boxes from last transition
      $(".nivo-box", slider).remove()
      currentEffect = settings.effect
      anims = ""
      
      # Generate random effect
      if settings.effect is "random"
        anims = new Array("sliceDownRight", "sliceDownLeft", "sliceUpRight", "sliceUpLeft", "sliceUpDown", "sliceUpDownLeft", "fold", "fade", "boxRandom", "boxRain", "boxRainReverse", "boxRainGrow", "boxRainGrowReverse")
        currentEffect = anims[Math.floor(Math.random() * (anims.length + 1))]
        currentEffect = "fade"  if currentEffect is `undefined`
      
      # Run random effect from specified set (eg: effect:'fold,fade')
      if settings.effect.indexOf(",") isnt -1
        anims = settings.effect.split(",")
        currentEffect = anims[Math.floor(Math.random() * (anims.length))]
        currentEffect = "fade"  if currentEffect is `undefined`
      
      # Custom transition as defined by "data-transition" attribute
      currentEffect = vars.currentImage.attr("data-transition")  if vars.currentImage.attr("data-transition")
      
      # Run effects
      vars.running = true
      timeBuff = 0
      i = 0
      slices = ""
      firstSlice = ""
      totalBoxes = ""
      boxes = ""
      if currentEffect is "sliceDown" or currentEffect is "sliceDownRight" or currentEffect is "sliceDownLeft"
        createSlices slider, settings, vars
        timeBuff = 0
        i = 0
        slices = $(".nivo-slice", slider)
        slices = $(".nivo-slice", slider)._reverse()  if currentEffect is "sliceDownLeft"
        slices.each ->
          slice = $(this)
          slice.css top: "0px"
          if i is settings.slices - 1
            setTimeout (->
              slice.animate
                opacity: "1.0"
              , settings.animSpeed, "", ->
                slider.trigger "nivo:animFinished"

            ), (100 + timeBuff)
          else
            setTimeout (->
              slice.animate
                opacity: "1.0"
              , settings.animSpeed
            ), (100 + timeBuff)
          timeBuff += 50
          i++

      else if currentEffect is "sliceUp" or currentEffect is "sliceUpRight" or currentEffect is "sliceUpLeft"
        createSlices slider, settings, vars
        timeBuff = 0
        i = 0
        slices = $(".nivo-slice", slider)
        slices = $(".nivo-slice", slider)._reverse()  if currentEffect is "sliceUpLeft"
        slices.each ->
          slice = $(this)
          slice.css bottom: "0px"
          if i is settings.slices - 1
            setTimeout (->
              slice.animate
                opacity: "1.0"
              , settings.animSpeed, "", ->
                slider.trigger "nivo:animFinished"

            ), (100 + timeBuff)
          else
            setTimeout (->
              slice.animate
                opacity: "1.0"
              , settings.animSpeed
            ), (100 + timeBuff)
          timeBuff += 50
          i++

      else if currentEffect is "sliceUpDown" or currentEffect is "sliceUpDownRight" or currentEffect is "sliceUpDownLeft"
        createSlices slider, settings, vars
        timeBuff = 0
        i = 0
        v = 0
        slices = $(".nivo-slice", slider)
        slices = $(".nivo-slice", slider)._reverse()  if currentEffect is "sliceUpDownLeft"
        slices.each ->
          slice = $(this)
          if i is 0
            slice.css "top", "0px"
            i++
          else
            slice.css "bottom", "0px"
            i = 0
          if v is settings.slices - 1
            setTimeout (->
              slice.animate
                opacity: "1.0"
              , settings.animSpeed, "", ->
                slider.trigger "nivo:animFinished"

            ), (100 + timeBuff)
          else
            setTimeout (->
              slice.animate
                opacity: "1.0"
              , settings.animSpeed
            ), (100 + timeBuff)
          timeBuff += 50
          v++

      else if currentEffect is "fold"
        createSlices slider, settings, vars
        timeBuff = 0
        i = 0
        $(".nivo-slice", slider).each ->
          slice = $(this)
          origWidth = slice.width()
          slice.css
            top: "0px"
            width: "0px"

          if i is settings.slices - 1
            setTimeout (->
              slice.animate
                width: origWidth
                opacity: "1.0"
              , settings.animSpeed, "", ->
                slider.trigger "nivo:animFinished"

            ), (100 + timeBuff)
          else
            setTimeout (->
              slice.animate
                width: origWidth
                opacity: "1.0"
              , settings.animSpeed
            ), (100 + timeBuff)
          timeBuff += 50
          i++

      else if currentEffect is "fade"
        createSlices slider, settings, vars
        firstSlice = $(".nivo-slice:first", slider)
        firstSlice.css width: slider.width() + "px"
        firstSlice.animate
          opacity: "1.0"
        , (settings.animSpeed * 2), "", ->
          slider.trigger "nivo:animFinished"

      else if currentEffect is "slideInRight"
        createSlices slider, settings, vars
        firstSlice = $(".nivo-slice:first", slider)
        firstSlice.css
          width: "0px"
          opacity: "1"

        firstSlice.animate
          width: slider.width() + "px"
        , (settings.animSpeed * 2), "", ->
          slider.trigger "nivo:animFinished"

      else if currentEffect is "slideInLeft"
        createSlices slider, settings, vars
        firstSlice = $(".nivo-slice:first", slider)
        firstSlice.css
          width: "0px"
          opacity: "1"
          left: ""
          right: "0px"

        firstSlice.animate
          width: slider.width() + "px"
        , (settings.animSpeed * 2), "", ->
          
          # Reset positioning
          firstSlice.css
            left: "0px"
            right: ""

          slider.trigger "nivo:animFinished"

      else if currentEffect is "boxRandom"
        createBoxes slider, settings, vars
        totalBoxes = settings.boxCols * settings.boxRows
        i = 0
        timeBuff = 0
        boxes = shuffle($(".nivo-box", slider))
        boxes.each ->
          box = $(this)
          if i is totalBoxes - 1
            setTimeout (->
              box.animate
                opacity: "1"
              , settings.animSpeed, "", ->
                slider.trigger "nivo:animFinished"

            ), (100 + timeBuff)
          else
            setTimeout (->
              box.animate
                opacity: "1"
              , settings.animSpeed
            ), (100 + timeBuff)
          timeBuff += 20
          i++

      else if currentEffect is "boxRain" or currentEffect is "boxRainReverse" or currentEffect is "boxRainGrow" or currentEffect is "boxRainGrowReverse"
        createBoxes slider, settings, vars
        totalBoxes = settings.boxCols * settings.boxRows
        i = 0
        timeBuff = 0
        
        # Split boxes into 2D array
        rowIndex = 0
        colIndex = 0
        box2Darr = []
        box2Darr[rowIndex] = []
        boxes = $(".nivo-box", slider)
        boxes = $(".nivo-box", slider)._reverse()  if currentEffect is "boxRainReverse" or currentEffect is "boxRainGrowReverse"
        boxes.each ->
          box2Darr[rowIndex][colIndex] = $(this)
          colIndex++
          if colIndex is settings.boxCols
            rowIndex++
            colIndex = 0
            box2Darr[rowIndex] = []

        
        # Run animation
        cols = 0

        while cols < (settings.boxCols * 2)
          prevCol = cols
          rows = 0

          while rows < settings.boxRows
            if prevCol >= 0 and prevCol < settings.boxCols
              
              # Due to some weird JS bug with loop vars 
              #                            being used in setTimeout, this is wrapped
              #                            with an anonymous function call 
              ((row, col, time, i, totalBoxes) ->
                box = $(box2Darr[row][col])
                w = box.width()
                h = box.height()
                box.width(0).height 0  if currentEffect is "boxRainGrow" or currentEffect is "boxRainGrowReverse"
                if i is totalBoxes - 1
                  setTimeout (->
                    box.animate
                      opacity: "1"
                      width: w
                      height: h
                    , settings.animSpeed / 1.3, "", ->
                      slider.trigger "nivo:animFinished"

                  ), (100 + time)
                else
                  setTimeout (->
                    box.animate
                      opacity: "1"
                      width: w
                      height: h
                    , settings.animSpeed / 1.3
                  ), (100 + time)
              ) rows, prevCol, timeBuff, i, totalBoxes
              i++
            prevCol--
            rows++
          timeBuff += 100
          cols++

    
    # Shuffle an array
    shuffle = (arr) ->
      j = undefined
      x = undefined
      i = arr.length

      while i
        j = parseInt(Math.random() * i, 10)
        x = arr[--i]
        arr[i] = arr[j]
        arr[j] = x
      arr

    
    # For debugging
    trace = (msg) ->
      console.log msg  if @console and typeof console.log isnt "undefined"

    
    # Start / Stop
    @stop = ->
      unless $(element).data("nivo:vars").stop
        $(element).data("nivo:vars").stop = true
        trace "Stop Slider"

    @start = ->
      if $(element).data("nivo:vars").stop
        $(element).data("nivo:vars").stop = false
        trace "Start Slider"

    
    # Trigger the afterLoad callback
    settings.afterLoad.call this
    this

  $.fn.nivoSlider = (options) ->
    @each (key, value) ->
      element = $(this)
      
      # Return early if this element already has a plugin instance
      return element.data("nivoslider")  if element.data("nivoslider")
      
      # Pass options to plugin constructor
      nivoslider = new NivoSlider(this, options)
      
      # Store plugin object in this element's data
      element.data "nivoslider", nivoslider


  
  #Default settings
  $.fn.nivoSlider.defaults =
    effect: "random"
    slices: 15
    boxCols: 8
    boxRows: 4
    animSpeed: 500
    pauseTime: 3000
    startSlide: 0
    directionNav: true
    controlNav: true
    controlNavThumbs: false
    pauseOnHover: true
    manualAdvance: false
    prevText: "Prev"
    nextText: "Next"
    randomStart: false
    beforeChange: ->

    afterChange: ->

    slideshowEnd: ->

    lastSlide: ->

    afterLoad: ->

  $.fn._reverse = [].reverse
) jQuery