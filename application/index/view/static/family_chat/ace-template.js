var AceTemplate = AceTemplate || {};

(function(){
	/**
	 * Ace Engine Template
	 * һ�׻���HTML��JS�﷨���ɴ����ģ��ϵͳ
	 * http://code.google.com/p/ace-engine/wiki/AceTemplate
	 * @author ������(wangjihu��http://weibo.com/zswang) ³��Ȼ(luyaran��http://weibo.com/zinkey)
	 * @version 2011-07-06 
 	 * @copyright (c) 2011, Baidu Inc, All rights reserved.
	 */

	/* Debug Start */
	var logger = {
		/**
		 * ��ӡ��־
		 * @param {Object} text ��־�ı�
		 */
		log: function(text) {
			/*
			var dom = document.getElementById("log");
			if (dom) {
				dom.value += text + "\n";
			}
			*/
			window.console && console.log(text)
		}
	};
	/* Debug End */
	
	var htmlDecodeDict = { "quot": '"', "lt": "<", "gt": ">", "amp": "&", "nbsp": " " };
	var htmlEncodeDict = { '"': "quot", "<": "lt", ">": "gt", "&": "amp", " ": "nbsp" };
	var lib = {
		/**
		 * ͨ��id���DOM����
		 * @param {String} id
		 */
		g: function(id){
			if (typeof id != "string") 
				return id;
			return document.getElementById(id);
		},
		/**
		 * HTML����
		 * @param {String} html
		 */
		decodeHTML: function(html) {
			return String(html).replace(/&(quot|lt|gt|amp|nbsp);/ig, function(all, key) {
				return htmlDecodeDict[key];
			}).replace(/&#u([a-f\d]{4});/ig, function(all, hex) {
				return String.fromCharCode(parseInt("0x" + hex));
			}).replace(/&#(\d+);/ig, function(all, number) {
				return String.fromCharCode(+number);
			});
		},
		
		/**
		 * HTML����
		 * @param {String} html 
		 */
		encodeHTML: function(html) {
			return String(html).replace(/["<>& ]/g, function(all) {
				return "&" + htmlEncodeDict[all] + ";";
			});
		},
		/**
		 * ���Ԫ���ı�
		 * @param {Element} element
		 */
		elementText: function(element) {
			if (!element || !element.tagName) return "";
			if (/^(input|textarea)$/i.test(element.tagName))
				return element.value;
			return lib.decodeHTML(element.innerHTML);
		}
	};
	
	/**
	 * ����������
	 */
	var readerCaches = {};
	
	/**
	 * �Ƿ�ע��������ģ��
	 */
	var registerAll = false;

	/**
	 * ����ģ��Ĵ�����
	 * ����JS��Ĺ���
	 * 	�������ַ���ͷ
	 * 		ʾ�������֡�#{value}��<div>
	 * 		����/^\s*[<>!#^&\u0000-\u0008\u007F-\uffff].*$/mg
	 * 	html��ǽ������磺
	 * 		ʾ����>��src="1.gif" />
	 * 		����/^.*[<>]\s*$/mg
	 * 	û�С�˫���š������š��ֺš����ţ���С���š�������else�ȵ�����䡢�磺
	 * 		ʾ����hello world
	 * 		����/^(?!\s*(else|do|try|finally)\s*$)[^'":;,\[\]{}()\n\/]+$/mg
	 * 	���Ա��ʽ
	 * 		ʾ����a="12" b="45"��a='ab' b="cd"
	 * 		����/^(\s*(([\w-]+\s*=\s*"[^"]*")|([\w-]+\s*=\s*'[^']*')))+\s*$/mg
	 * 	��ʽ���ʽ
	 * 		ʾ����div.focus{color: #fff;}��#btnAdd span{}
	 * 		����/^\s*([.#][\w-.]+(:\w+)?(\s*|,))*(?!(else|do|while|try|return)\b)[.#]?[\w-.*]+(:\w+)?\s*\{.*$/mg
	 * @param {String} template ģ���ַ�
	 */
	function analyse(template) {
		var body = [], processItem = [];
		body.push("with(this){");
		body.push(template
			.replace(/[\r\n]+/g, "\n") // ȥ������Ļ��У�����ȥ��IE�������˵�\r
			.replace(/^\n+|\s+$/mg, "") // ȥ�����У��ײ����У�β���հ�
			.replace(/((^\s*[<>!#^&\u0000-\u0008\u007F-\uffff].*$|^.*[<>]\s*$|^(?!\s*(else|do|try|finally)\s*$)[^'":;,\[\]{}()\n\/]+$|^(\s*(([\w-]+\s*=\s*"[^"]*")|([\w-]+\s*=\s*'[^']*')))+\s*$|^\s*([.#][\w-.]+(:\w+)?(\s*|,))*(?!(else|do|while|try|return)\b)[.#]?[\w-.*]+(:\w+)?\s*\{.*$)\s?)+/mg, function(expression) { // ���ԭ��
				expression = ['"', expression
					.replace(/&none;/g, "") // ���ַ�
					.replace(/["'\\]/g, "\\$&") // ����ת���
					.replace(/\n/g, "\\n") // ����س�ת���
					.replace(/(!?#)\{(.*?)\}/g, function (all, flag, template) { // �����滻
						template = template.replace(/\\n/g, "\n").replace(/\\([\\'"])/g, "$1"); // ��ԭת��
						var identifier = /^[a-z$][\w+$]+$/i.test(template) &&
							!(/^(true|false|NaN|null|this)$/.test(template)); // ������������һ��δ���屣��
						return ['",', 
							identifier ? ['typeof ', template, '=="undefined"?"":'].join("") : "", 
							(flag == "#" ? '_encode_' : ""), 
							'(', template, '),"'].join("");
					}), '"'].join("").replace(/^"",|,""$/g, "");
				if (expression)	
					return ['_output_.push(', expression, ');'].join("");
				else return "";
			}));
		body.push("}");
		var result = new Function("_output_", "_encode_", "helper", body.join(""));
		/* Debug Start */
//		logger.log(String(result));
		/* Debug End */
		return result;
	}

	/**
	 * ��ʽ�����
	 * @param {String|Element} id ģ��ID����ģ�屾��(�Ǳ�ʶ����ʶ��Ϊģ�屾��)
	 * @param {Object} data ��ʽ�������ݣ�Ĭ��Ϊ���ַ���
	 * @param {Object} helper ��������(Ĭ��Ϊģ�����)
	 */
	AceTemplate.format = function(id, data, helper) {
		if (!id) return "";
		var reader, element;
		if (typeof id == "object" && id.tagName) { // �����Dom����
			element = id;
			id = element.getAttribute("id");
		}
		helper = helper || this; // Ĭ�ϸ�������
		reader = readerCaches[id]; // ���ȶ�ȡ����
		if (!reader) { // ������δ����
			if (!/[^\w-]/.test(id)) { // �Ϸ��ı�ʶ����id��ȡ
				if (!element) {
					element = lib.g(id);
				}
				reader = this.register(id, element);
			} else {
				reader = analyse(id);
			}
		}
		var output = [];
		reader.call(data || "", output, lib.encodeHTML, helper);
		return output.join("");
	};
	
	/**
	 * ע��ģ�壬���û�в�������ע������script��ǩģ��
	 * @param {String} id ģ��ID
	 * @param {Element|String} target ģ����������ģ���ַ��������û����Ĭ�ϻ�ȡid��Ӧ��DOM����
	 */
	AceTemplate.register = function(id, target) {
		if (!arguments.length && !registerAll) { // �޲�������û��ע���
			registerAll = true;
			var scripts = document.getElementsByTagName("script");
			for (var i = 0; i < scripts.length; i++) {
				var script = scripts[i];
				if (/^(text\/template)$/i.test(script.getAttribute("type"))) {
					var id = script.getAttribute("id");
					id && arguments.callee.call(this, id, script);
				}
			}
		}
		if (!id) return;
		if (readerCaches[id]) { // ����Ѿ�ע��
			return readerCaches[id];
		}
		if (typeof target != "string") {
			if (typeof target == "undefined") {
				target = lib.g(id);
			}
			target = lib.elementText(target);
		}
		return readerCaches[id] = analyse(target);
	};
	
	/**
	 * ע��ģ��
	 * @param {String} id ģ��ID
	 */
	AceTemplate.unregister = function(id) {
		delete readerCaches[id];
	};
})();