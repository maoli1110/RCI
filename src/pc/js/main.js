var animateFlag = false;
var step1,step2;
var locationUrl = location.search;
window.onload = function() {

    //固定到顶部
    var tabFlag=true;
 //    document.getElementsByClassName("page2_wrap")[0].onscroll=function(){
	// 	h = $(".page2_wrap").scrollTop();
 //        //console.log(h);
	// 	if(h >= 800&&h<4468&&tabFlag){
	// 		$('.mock_title').show();
	// 	}
	// 	else if(h >= 800&&h<2326&&tabFlag==false){
	// 		$('.mock_title').show();
	// 	}
	// 	else{
	// 		$('.mock_title').hide();
	// 	}
	// };

    $(".again_btn").click(function () {
        if (btnflag)
            return;
        showResult();
        btnflag = true;
        //抽奖
    });

	// 什么是利是
	$(".rst_what").hover(function() {
		$(".rst_pop").toggle();
	});

	// 切换按钮
	$(".switch_btn").click(function() {
		$(this).toggleClass("rotate");
	});

	$(".lz_title").on('click',function(){
		$(".lz_title").addClass("cur").siblings().removeClass("cur");
		$(".tabA").show();
		$(".tabB").hide();
		tabFlag=true;
	});

   // 活动规则
	$('.rule_btn').click(function(){
		$(".rules").show();
    });
	$(".close").click(function(){
		$(".rules").hide();
    });
    $(".gp_title").on('click',function(){
		$(".gp_title").addClass("cur").siblings().removeClass("cur");
		$(".tabB").show();
		$(".tabA").hide();
		tabFlag=false;
	});
    //tag
    $('.line_lineTag').on('mouseenter', function(event) {
    	var tagName=$(this).text();
    	$(this).find('.tagImg').show();
    });
    $('.line_lineTag').on('mouseout', function(event) {
    	$(this).find('.tagImg').hide();
    });



}