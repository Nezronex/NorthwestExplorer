jQuery(function($){
	
	$(document).ready(function(){
		
		// fix widths from WordPress default captions
		$.each($(".wp-caption"), function(){
			$(this).width($(this).find('img').attr('width'));
		});
		
		// moving images inserted without captions to be in their own divs to make it easier to float and remove them
		$.each($('p img'), function(){
			var align = 'aligncenter';
			if ($(this).hasClass('alignleft')) align = 'alignleft';
			if ($(this).hasClass('alignright')) align = 'alignright';
			if ($(this).hasClass('aligncenter')) align = 'aligncenter';
			if ($(this).hasClass('alignnone')) align = 'alignnone';
			$(this).removeClass('alignleft aligncenter alignright alignnone');
			
			$(this).parent().before($(this));
			$(this).wrap('<div class="' + align + '"></div>');
			$(this).closest('.print-image').append('<div class="clear"></div>');
		});
		
		// make sure all images have the same class to make it easier to delete them in edit mode
		$.each($(".story-body-wrapper img"), function(){
			$(this).parent('div').addClass('print-image resizable').width($(this).attr('width'));
			$(this).width('100%').height('auto');
		});

		// make sure all images inserted into the post body with captionshave the same class to make it easier to delete them in edit mode
		$.each($("figure img"), function(){
			$(this).parent('figure').addClass('print-image resizable').width($(this).attr('width'));
			$(this).width('100%').height('auto');
		});
		
		// activate editing tools for heading elements
		$("body").on('mouseenter', '.edit-mode h1.printheadline, .edit-mode p.printdeck, .edit-mode .title-area, .edit-mode .mini-logo-wrap, .edit-mode .printbyline', function(){ 
			$("body").find('.heading-buttons').appendTo($(this)).fadeIn();
		});
		
		// activate editing tools for main body paragraphs			
		$("body").on('mouseenter', '.edit-mode .story-body-wrapper > p', function(){
			$('.story-body-wrapper p').css({'margin-left': 0, 'margin-right': 0 }); // set p widths back to full width if they were changed by the editing process
			var leftMargin = $(this).getOffset('left');
			var rightMargin = $(this).getOffset('right');
			if ($(this).find('img').length) {
				leftMargin = 0;
				rightMargin = 0;	
			}
			$(this).css({'margin-left': leftMargin, 'margin-right': rightMargin });
			$('.image-buttons, .heading-buttons').hide();
			remove_link = $("body").find('.remove').appendTo($(this)).show();
		});
		
		// make a photo div highlighted and ready to be deleted/edited
		$("body").on('mouseenter', '.edit-mode .story-body-wrapper > .print-image', function(){
			$('.remove, .heading-buttons').hide();
			alignment = $("body").find('.image-buttons').appendTo($(this)).fadeIn();
			$('.alignment-icon').removeClass('aligned');
			if ($(this).hasClass('alignright')) {
				$('.action-right').addClass('aligned');
			}
			if ($(this).hasClass('alignleft')) {
				$('.action-right').addClass('aligned');
			}
		});

		// action for deleting paragraphs
		$("body").on('click', '.remove i', function(){
			$(this).closest('p').fadeOut();
		});
		
		// action for deleting photo divs
		$("body").on('click', '.img-remove', function(){
			$(this).closest('.print-image').fadeOut();
			$('.story-body-wrapper p').css({'margin-left': 0, 'margin-right': 0 }); // set p widths back to full width if they were changed by the editing process
		});
		
		// action for deleting heading elements
		$("body").on('click', '.heading-remove', function() {
			$(this).parent().parent().fadeOut();
		});
		
		// function for changing alignment of image divs
		$('body').on('click', '.print-image .alignment-icon', function(){
			var alignment = $(this).data('class');
			$(this).closest('.print-image').removeClass('alignleft aligncenter alignright alignnone').addClass(alignment);
			if (alignment == 'aligncenter') $(this).closest('.print-image').width($(this).closest('.print-image').find('img').width());
			$('.story-body-wrapper p').css({'margin-left': 0, 'margin-right': 0 }); // set p widths back to full width if they were changed by the editing process
		});

		// function for changing alignment of header elements
		$('body').on('click', 'p.printdeck .text-alignment, h1.printheadline .text-alignment', function(){
			var alignment = $(this).data('class');
			$(this).parent().parent().removeClass('aligntextleft aligntextcenter').addClass(alignment);
		});

		// function to change font size of main story paragraphs 
		$('body').on('click', '.action-increase, .action-decrease', function() {
			var size = parseInt($('body .story-body-wrapper > p').css("font-size"));
			if ($(this).data('action') == "increase") {
				size += 1;
			} else {
				size -= 1;
			}
			var line = size * 1.5;
			size = size + "px"
			line = line + "px";
			$('.story-body-wrapper > p').css({ 'font-size': size, 'line-height': line, 'margin-bottom': size });
		});

		// function to change font size for header elements on click
		$('body').on('click', '.header-increase, .header-decrease', function() {
			var size = parseInt($(this).parent().parent().css("font-size"));
			if ($(this).data('action') == "increase") {
				size += 1;
			} else {
				size -= 1;
			}
			var line = size * 1.4;
			size = size + "px"
			line = line + "px";
			$(this).parent().parent().css({ 'font-size': size, 'line-height': line });
		});

		// show action bar tooltips
		$('body').on('mouseenter','.hastooltip', function(){
			var tooltip = '<div class="print-tooltip">'+ $(this).attr('data-tooltip') + '</div>'
			$(tooltip).hide().appendTo($(this)).fadeIn();
		})
		
		// hide action bar tooltips
		$('body').on('mouseleave','.hastooltip', function(){
			$('.print-tooltip').remove();
		})
		
		// activate edit mode on action button click
		$('body').on('click', '.action-edit', function(){
			$(this).toggleClass('active-button');
			$('.print-wrapper').toggleClass('edit-mode print-mode');
			$('.story-body-wrapper p').css({'margin-left': 0, 'margin-right': 0 }); // set p widths back to full width if they were changed by the editing process
			if ($('.print-wrapper').hasClass('edit-mode')) {
				make_resizable();
				$('.text-adjuster').slideDown();
			} else {
				$('.resizable').resizable('destroy');
				$('.text-adjuster').slideUp();
			}
		});
		
		// function for calculating the width of text within p tags so that the outline can be tightly set around the text and adjusted for left and right wrapped elements
		$.fn.getOffset = function(direction){
			var html_org = $(this).html();
			var html_calc = '<span>' + html_org + '</span>';
			$(this).html(html_calc);
			var width = $(this).find('span:first').width();
			if (direction == "left") var Offset =  $(this).find('span:first').offset().left - $(".story-body-wrapper").offset().left;
			if (direction == "right") {
				var textRight = $(this).find('span:first').offset().left + $(this).find('span:first').width();
				var wrapperRight = $('.story-body-wrapper').offset().left + $('.story-body-wrapper').width(); 
				var Offset = wrapperRight - textRight;
				if (Offset < 75) {
					Offset = 0;
				} else {
					var photoOffset = $(this).prevAll('.alignright').outerWidth(true);
					if (Offset > photoOffset) Offset = photoOffset;
					if (Offset < photoOffset) Offset -= 50;
				}
			}
			$(this).html(html_org);
			return Offset;
		};
		
		// using this to remove random things that WP might be adding via hooks in the header and footer
		$('body').children().each(function(){
			if ($(this).hasClass('print-wrapper') || $(this).hasClass('action-bar')) return;
			$(this).remove();
		});
		
		// stupid Print Friendly plugin
		if ($('div.pf-content').length) $('div.pf-content').contents().unwrap();	
		
	});

});

// jQuery resizable function activated on click of Edit button and destroyed on close
function make_resizable() {
	jQuery( function($) {
		$(".edit-mode .resizable").each(function(){
			$(this).resizable({
				minWidth: 100,
				maxWidth: $('.story-body-wrapper').width(),
				handles: "w,e",
				resize: function (event,ui){
					ui.position.left = ui.originalPosition.left;
					ui.size.width = ( ui.size.width - ui.originalSize.width ) + ui.originalSize.width;
		   		}
			});
		});
	});
}

// Detect Command/Control P for a cleaner printing experience
var meta_key = false;
jQuery(document).on('keydown', function(e) {
	if (e.metaKey || e.ctrlKey) {
		meta_key = true;
	}
})	
var p_key = false;
jQuery(document).on('keydown', function(e) {
	if (e.which == 80 || e.which == 112) {
		if (meta_key == true) {
			meta_key = false;
			e.preventDefault(); // stops the default print action so that our custom action can run unimpeded
			sno_print(); // run our custom print action
		}
	}
});
jQuery(document).on('keyup', function() {
	meta_key = false;
});
		
// function to initiate print process -- called when print button or keyboard shortcut is used
function sno_print() {
	jQuery('.action-edit').removeClass('active-button');
	jQuery('.text-adjuster').hide();
	if (jQuery('.print-wrapper').hasClass('edit-mode')) jQuery('.print-wrapper').toggleClass('edit-mode print-mode');
	jQuery(".remove, .heading-buttons, .image-buttons, .action-bar").hide();
	if (jQuery(".ui-resizable").length) jQuery('.resizable').resizable('destroy');
	jQuery('.story-body-wrapper p').css({'margin-left': 0, 'margin-right': 0 }); // set p widths back to full width if they were changed by the editing process
	window.print();
    window.onafterprint = function(e){
        jQuery(window).off('mousemove', window.onafterprint);
        jQuery(".action-bar").show();
    };
    setTimeout(function(){
        jQuery(window).on('mousemove', window.onafterprint);
    }, 1);
}

// function to generate a PDF option
function sno_pdf() {
	jQuery('.action-edit').removeClass('active-button');
	jQuery('.text-adjuster').hide();
	if (jQuery('.print-wrapper').hasClass('edit-mode')) jQuery('.print-wrapper').toggleClass('edit-mode print-mode');
	jQuery(".remove, .heading-buttons, .image-buttons").hide();
	if (jQuery(".ui-resizable").length) jQuery('.resizable').resizable('destroy');
	jQuery('.story-body-wrapper p').css({'margin-left': 0, 'margin-right': 0 }); // set p widths back to full width if they were changed by the editing process

	var pdfContent = document.getElementById('pdf-wrapper');
	var opt = {
		margin: 1.27,
		filename: jQuery('h1.printheadline').data('title').replace(/ /g, '-').toLowerCase() + '.pdf',
		image: { 
			type: 'jpeg', 
			quality: 0.98 
		},
		html2canvas: { 
			scale: 2 
		},
		jsPDF: { 
			unit: 'cm', 
			format: 'letter', 
			orientation: 'portrait' 
		},
		pagebreak: { 
			mode: ['avoid-all', 'css', 'legacy'] 
		}
	};
	html2pdf().set(opt).from(pdfContent).save();
}
