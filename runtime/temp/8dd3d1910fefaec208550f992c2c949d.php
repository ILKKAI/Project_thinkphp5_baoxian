<?php if (!defined('THINK_PATH')) exit(); /*a:1:{s:67:"/var/www/html/www/whyaojin.cn/application/admin/view/upyun_wap.html";i:1507610122;}*/ ?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title><?php echo config("config.ss_site_name"); ?></title>
<meta http-equiv="MSThemeCompatible" content="Yes" />
<script src="<?php echo config("config.ss_web_root"); ?>/plugins/jQuery/jQuery-2.1.4.min.js"></script>
<script src="<?php echo config("config.ss_web_root"); ?>/artDialog/jquery.artDialog.js?skin=default"></script>
<script src="<?php echo config("config.ss_web_root"); ?>/artDialog/plugins/iframeTools.js"></script>
<script src="<?php echo config("config.ss_web_root"); ?>/upyun.js?2013"></script>
</head>
<body style="background:#fff">
<?php if(request()->param("error") == null){ ?>
<div></div>
<form enctype="multipart/form-data" action="<?php echo url("Upyun/upload"); ?>" id="thumbForm" method="POST" style="font-size:14px;padding:10px 20px 10px 20px;">
<p><div><div style="font-size:14px;">选择本地文件：<br><br><input type="file" style="width:80%;border:1px solid #ddd" name="upload[]" /></div><div style="padding:20px 0;text-align:center;"><input id="submitbtn" name="doSubmit" type="submit" class="btnGreen" value="上传" onclick="this.value='上传中...'" /></div></p>
    <input type="hidden" value="<?php echo input('width'); ?>" id="width" name="width" /><input type="hidden" value="<?php echo input('height'); ?>"id="height" name="height" />
</form>
<script>
if (art.dialog.data('width')) {
	document.getElementById('width').value = art.dialog.data('width');// 获取由主页面传递过来的数据
	document.getElementById('height').value = art.dialog.data('height');
};
</script>
<?php }else{ ?>
<div style="text-align:center;line-height:140px;font-size:14px;"> <img src="<?php echo config("config.ss_web_root"); ?>/images/export.png" align="absmiddle" /> <?php if(request()->param("error")==0){echo '上传成功';}else{echo urldecode(request()->param("msg"));} ?>  </div>
<script>
var domid=art.dialog.data('domid');
// 返回数据到主页面
function returnHomepage(url){
	var origin = artDialog.open.origin;
	var dom = origin.document.getElementById(domid);
	var domsrcid=domid+'_src';

	if(origin.document.getElementById(domsrcid)){
	origin.document.getElementById(domsrcid).src=url;
	origin.document.getElementById(domsrcid).className='upImgClass';
	}

	dom.value=url;
	setTimeout("art.dialog.close()", 1500 )
}
<?php if(request()->param("error") == 0 ){ ?>
returnHomepage('<?php
        $tmp = request()->param("msg");
        $tmp = str_replace("MM","\/",$tmp);
        echo urldecode($tmp);?>');
<?php }?>
</script>
<?php }?>



</body>
</html>