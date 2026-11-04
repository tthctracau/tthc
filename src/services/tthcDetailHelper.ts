import { TTHCItem } from '../types';

export interface TthcProcedureDetails {
  code: string;
  title: string;
  category: string;
  agency: string;
  level: string;
  url: string;
  receivingAgency: string;
  duration: string;
  durationDetail: string;
  fee: string;
  feeDetail: string;
  dossier: {
    stt: number;
    name: string;
    original: string; // Bản chính
    copy: string;     // Bản sao
    note?: string;
  }[];
  submissionMethods: string[];
  executionSteps: string[];
  result: string;
  legalBases: string[];
}

/**
 * Tạo dữ liệu chi tiết thủ tục hành chính đầy đủ và chuẩn xác theo quy định của UBND cấp xã/phường
 */
export function getDetailedTthcInfo(item: TTHCItem): TthcProcedureDetails {
  const titleLower = item.title.toLowerCase();
  const catLower = item.category.toLowerCase();

  // Mặc định chung
  let duration = item.duration || '03 ngày làm việc kể từ ngày nhận đủ hồ sơ hợp lệ';
  let durationDetail = 'Thời hạn giải quyết tính từ thời điểm Trung tâm Phục vụ hành chính công phường Trà Câu tiếp nhận hồ sơ hợp lệ trên Hệ thống thông tin giải quyết TTHC.';
  let fee = item.fee || 'Miễn phí';
  let feeDetail = 'Không thu phí hoặc thực hiện theo quy định của Hội đồng nhân dân tỉnh.';
  let result = item.result || 'Văn bản chấp thuận / Giấy xác nhận / Kết quả TTHC có ký số điện tử';
  const receivingAgency = item.agencyExecution || 'Trung tâm Phục vụ hành chính công phường Trà Câu';

  let dossierList: { stt: number; name: string; original: string; copy: string; note?: string }[] = [];
  const legalBases: string[] = [
    'Nghị định số 61/2018/NĐ-CP của Chính phủ về thực hiện cơ chế một cửa, một cửa liên thông trong giải quyết TTHC',
    'Nghị định số 45/2020/NĐ-CP về thực hiện thủ tục hành chính trên môi trường điện tử',
    'Quyết định công bố Danh mục thủ tục hành chính thuộc thẩm quyền giải quyết của UBND cấp xã',
  ];

  // 1. LĨNH VỰC CHỨNG THỰC
  if (titleLower.includes('chứng thực') || catLower.includes('chứng thực')) {
    if (titleLower.includes('chữ ký') || titleLower.includes('điểm chỉ')) {
      duration = 'Trong ngày làm việc (ngay khi tiếp nhận hồ sơ)';
      durationDetail = 'Giải quyết và trả kết quả ngay sau khi người tiếp nhận hồ sơ chứng kiến người yêu cầu ký tên hoặc điểm chỉ.';
      fee = '10.000 đồng/trường hợp (trường hợp được tính theo số chữ ký trong một văn bản)';
      feeDetail = 'Thu theo quy định tại Thông tư 226/2016/TT-BTC và Nghị quyết HĐND tỉnh.';
      result = 'Văn bản được chứng thực chữ ký (kèm lời chứng và chữ ký số/con dấu của UBND phường)';
      dossierList = [
        {
          stt: 1,
          name: 'Giấy tờ, văn bản mà người yêu cầu chứng thực sẽ ký hoặc điểm chỉ vào đó (không được ký trước)',
          original: 'Bản chính',
          copy: '00',
          note: 'Người ký phải trực tiếp ký trước mặt công chức tiếp nhận hồ sơ',
        },
        {
          stt: 2,
          name: 'Bản chính Căn cước công dân / Thẻ căn cước hoặc tài khoản Định danh điện tử VNeID mức 2 của người yêu cầu',
          original: 'Xuất trình',
          copy: '00',
          note: 'Kiểm tra đối chiếu thông tin nhân thân trực tiếp',
        },
      ];
    } else if (titleLower.includes('hợp đồng') || titleLower.includes('giao dịch')) {
      duration = 'Không quá 02 ngày làm việc (kể từ khi nhận đủ hồ sơ)';
      durationDetail = 'Trường hợp hợp đồng, giao dịch có nội dung phức tạp thì thời hạn có thể kéo dài thêm nhưng không quá 05 ngày làm việc.';
      fee = '30.000 - 50.000 đồng/hợp đồng, giao dịch';
      feeDetail = 'Mức thu phí chứng thực hợp đồng, giao dịch áp dụng theo Thông tư liên tịch của Bộ Tư pháp và Bộ Tài chính.';
      result = 'Hợp đồng, giao dịch có chứng thực của Chủ tịch / Phó Chủ tịch UBND phường';
      dossierList = [
        {
          stt: 1,
          name: 'Dự thảo hợp đồng, giao dịch giữa các bên tham gia',
          original: '01 bản',
          copy: '00',
          note: 'Các bên chuẩn bị sẵn hoặc lập theo mẫu quy định',
        },
        {
          stt: 2,
          name: 'Bản chính giấy tờ tùy thân (Căn cước công dân / Hộ chiếu) của các bên tham gia giao dịch',
          original: 'Xuất trình',
          copy: '01 bản chụp',
          note: 'Đối chiếu thông tin',
        },
        {
          stt: 3,
          name: 'Bản sao kèm bản chính Giấy chứng nhận quyền sở hữu, sử dụng tài sản liên quan đến giao dịch (GCN QSD đất, đăng ký xe,...)',
          original: 'Xuất trình',
          copy: '01 bản',
          note: 'Chứng minh tài sản hợp pháp',
        },
      ];
    } else {
      // Chứng thực bản sao từ bản chính
      duration = 'Trong ngày làm việc (ngay sau khi tiếp nhận)';
      durationDetail = 'Giải quyết ngay trong ngày làm việc. Nếu yêu cầu chứng thực từ 20 bản sao trở lên thì thời hạn trả kết quả không quá 02 ngày làm việc.';
      fee = '2.000 đồng/trang (từ trang thứ 3 trở đi thu 1.000 đồng/trang, tối đa không quá 200.000 đồng/bản)';
      feeDetail = 'Thu theo Thông tư số 226/2016/TT-BTC của Bộ Tài chính.';
      result = 'Bản sao đã được chứng thực đúng với bản chính (có dấu đỏ hoặc chữ ký số)';
      dossierList = [
        {
          stt: 1,
          name: 'Bản chính giấy tờ, văn bản làm cơ sở để chứng thực bản sao',
          original: 'Bản chính',
          copy: '00',
          note: 'Bản chính còn nguyên vẹn, không bị tẩy xóa, sửa chữa bất hợp pháp',
        },
        {
          stt: 2,
          name: 'Bản chụp / photo giấy tờ cần chứng thực (hoặc yêu cầu Bộ phận Một cửa hỗ trợ sao chụp)',
          original: '00',
          copy: 'Theo nhu cầu',
          note: 'Số lượng theo yêu cầu của cá nhân, tổ chức',
        },
      ];
    }
  }
  // 2. LĨNH VỰC HỘ TỊCH
  else if (catLower.includes('hộ tịch') || titleLower.includes('khai sinh') || titleLower.includes('khai tử') || titleLower.includes('kết hôn') || titleLower.includes('tình trạng hôn nhân') || titleLower.includes('trích lục')) {
    if (titleLower.includes('khai sinh')) {
      duration = 'Trong ngày làm việc (ngay sau khi nhận đủ hồ sơ)';
      durationDetail = 'Trường hợp cần xác minh, thời hạn không quá 03 ngày làm việc kể từ ngày tiếp nhận.';
      fee = 'Miễn lệ phí (khi đăng ký đúng hạn); Quá hạn / Bản sao trích lục: 8.000 đồng/bản';
      feeDetail = 'Miễn lệ phí theo Luật Hộ tịch đối với người đăng ký khai sinh đúng hạn, người thuộc hộ nghèo, gia đình chính sách.';
      result = 'Giấy khai sinh (bản chính) và trích lục bản sao khai sinh (theo yêu cầu)';
      dossierList = [
        {
          stt: 1,
          name: 'Tờ khai đăng ký khai sinh (theo mẫu quy định hoặc kê khai trực tuyến trên Dịch vụ công)',
          original: '01 bản',
          copy: '00',
          note: 'Kê khai đầy đủ thông tin của trẻ và cha, mẹ',
        },
        {
          stt: 2,
          name: 'Giấy chứng sinh do Bệnh viện / Trung tâm Y tế cấp (trường hợp sinh tại nhà phải có văn bản xác nhận của người làm chứng hoặc giấy cam đoan)',
          original: '01 bản chính',
          copy: '00',
          note: 'Bản gốc cấp tại cơ sở y tế',
        },
        {
          stt: 3,
          name: 'Giấy chứng nhận kết hôn của cha mẹ (nếu cha mẹ có đăng ký kết hôn) để xuất trình',
          original: 'Xuất trình',
          copy: '00',
          note: 'Nếu hệ thống đã liên thông dữ liệu dân cư thì không cần xuất trình',
        },
        {
          stt: 4,
          name: 'Xuất trình Thẻ Căn cước công dân / Tài khoản VNeID mức 2 của người nộp hồ sơ',
          original: 'Xuất trình',
          copy: '00',
          note: 'Kiểm tra qua VNeID',
        },
      ];
    } else if (titleLower.includes('kết hôn')) {
      duration = 'Trong ngày làm việc (ngay sau khi nhận đủ hồ sơ hợp lệ)';
      durationDetail = 'Trường hợp cần xác minh điều kiện kết hôn thì thời hạn không quá 05 ngày làm việc.';
      fee = 'Miễn lệ phí đối với công dân Việt Nam cư trú trong nước; Đăng ký có yếu tố nước ngoài: 30.000 đồng/trường hợp';
      feeDetail = 'Căn cứ Luật Hộ tịch và Nghị quyết HĐND tỉnh.';
      result = 'Giấy chứng nhận kết hôn (mỗi bên vợ, chồng được nhận 01 bản chính)';
      dossierList = [
        {
          stt: 1,
          name: 'Tờ khai đăng ký kết hôn theo mẫu (hai bên nam, nữ cùng ký tên)',
          original: '01 bản chính',
          copy: '00',
          note: 'Khai đầy đủ thông tin hai bên',
        },
        {
          stt: 2,
          name: 'Giấy xác nhận tình trạng hôn nhân của bên không thường trú tại phường Trà Câu (nếu cư trú ở nơi khác)',
          original: '01 bản chính',
          copy: '00',
          note: 'Thời hạn giá trị trong vòng 06 tháng kể từ ngày cấp',
        },
        {
          stt: 3,
          name: 'Thẻ Căn cước công dân hoặc VNeID mức độ 2 của hai bên nam và nữ',
          original: 'Xuất trình',
          copy: '00',
          note: 'Cả hai bên nam, nữ phải có mặt ký vào Sổ hộ tịch và Giấy đăng ký kết hôn',
        },
      ];
    } else if (titleLower.includes('khai tử')) {
      duration = 'Trong ngày làm việc (ngay sau khi nhận đủ hồ sơ)';
      durationDetail = 'Giải quyết ngay trong ngày làm việc khi nhận đủ hồ sơ hợp lệ để gia đình kịp thời tổ chức tang lễ.';
      fee = 'Miễn lệ phí (đăng ký đúng thời hạn quy định)';
      feeDetail = 'Miễn hoàn toàn lệ phí theo quy định của Luật Hộ tịch.';
      result = 'Trích lục khai tử (bản chính) và các bản sao theo nhu cầu';
      dossierList = [
        {
          stt: 1,
          name: 'Tờ khai đăng ký khai tử (theo mẫu quy định)',
          original: '01 bản chính',
          copy: '00',
          note: 'Khai báo theo mẫu của Bộ Tư pháp',
        },
        {
          stt: 2,
          name: 'Giấy báo tử hoặc giấy tờ thay thế Giấy báo tử do cơ quan y tế / công an có thẩm quyền cấp',
          original: '01 bản chính',
          copy: '00',
          note: 'Cơ quan y tế nơi người mất cấp',
        },
        {
          stt: 3,
          name: 'Xuất trình CCCD/VNeID của người đi khai tử và giấy tờ chứng minh quan hệ thân nhân (nếu có)',
          original: 'Xuất trình',
          copy: '00',
          note: 'Đối chiếu thông tin',
        },
      ];
    } else if (titleLower.includes('tình trạng hôn nhân') || titleLower.includes('xác nhận độc thân')) {
      duration = '03 ngày làm việc (kể từ ngày nhận đủ hồ sơ hợp lệ)';
      durationDetail = 'Trường hợp cần xác minh tình trạng hôn nhân qua nhiều nơi cư trú khác nhau thì thời hạn tối đa không quá 10 ngày làm việc.';
      fee = '15.000 đồng/trường hợp (cấp bản chính)';
      feeDetail = 'Theo Nghị quyết quy định mức thu lệ phí hộ tịch của Hội đồng nhân dân tỉnh.';
      result = 'Giấy xác nhận tình trạng hôn nhân (có thời hạn 06 tháng sử dụng)';
      dossierList = [
        {
          stt: 1,
          name: 'Tờ khai cấp Giấy xác nhận tình trạng hôn nhân (theo mẫu quy định)',
          original: '01 bản chính',
          copy: '00',
          note: 'Ghi rõ mục đích sử dụng (để kết hôn, vay vốn, chuyển nhượng nhà đất,...)',
        },
        {
          stt: 2,
          name: 'Bản án/Quyết định ly hôn đã có hiệu lực pháp luật của Tòa án (nếu đã ly hôn)',
          original: 'Xuất trình',
          copy: '01 bản',
          note: 'Trường hợp trước đó đã kết hôn nhưng đã ly hôn',
        },
        {
          stt: 3,
          name: 'Trích lục khai tử của vợ/chồng (trường hợp vợ hoặc chồng đã chết)',
          original: 'Xuất trình',
          copy: '01 bản',
          note: 'Chứng minh tình trạng độc thân do góa vợ/chồng',
        },
        {
          stt: 4,
          name: 'Xuất trình Căn cước công dân hoặc VNeID mức 2 của người yêu cầu',
          original: 'Xuất trình',
          copy: '00',
          note: 'Đối chiếu người nộp',
        },
      ];
    } else {
      // Hộ tịch khác: Trích lục, thay đổi, cải chính, nhận cha mẹ con
      duration = 'Trong ngày làm việc (hoặc tối đa 03 ngày nếu cần xác minh)';
      durationDetail = 'Thủ tục cấp trích lục hộ tịch giải quyết ngay trong ngày làm việc.';
      fee = '8.000 đồng/bản trích lục';
      feeDetail = 'Theo quy định của Thông tư 281/2016/TT-BTC và HĐND tỉnh.';
      result = 'Trích lục hộ tịch bản sao / Quyết định công nhận thay đổi, cải chính hộ tịch';
      dossierList = [
        {
          stt: 1,
          name: 'Tờ khai yêu cầu cấp trích lục hộ tịch / đăng ký hộ tịch theo mẫu tương ứng',
          original: '01 bản chính',
          copy: '00',
          note: 'Điền thông tin sự kiện hộ tịch cần tra cứu',
        },
        {
          stt: 2,
          name: 'Xuất trình Căn cước công dân / Hộ chiếu hoặc VNeID của người yêu cầu',
          original: 'Xuất trình',
          copy: '00',
          note: 'Đối chiếu nhân thân',
        },
        {
          stt: 3,
          name: 'Văn bản ủy quyền hợp pháp (nếu ủy quyền cho người khác đi làm thay, trừ trường hợp là ông, bà, cha, mẹ, con, vợ, chồng)',
          original: '01 bản chính',
          copy: '00',
          note: 'Được chứng thực theo quy định',
        },
      ];
    }
  }
  // 3. LĨNH VỰC ĐẤT ĐAI / ĐỊA CHÍNH / XÂY DỰNG
  else if (catLower.includes('đất đai') || catLower.includes('xây dựng') || titleLower.includes('đất') || titleLower.includes('nhà ở') || titleLower.includes('xây dựng')) {
    duration = 'Từ 03 đến 15 ngày làm việc (tùy tính chất thẩm tra thực địa)';
    durationDetail = 'Quy trình bao gồm thẩm tra thực địa của công chức Địa chính - Xây dựng, niêm yết công khai và lập tờ trình thẩm định.';
    fee = 'Phí thẩm định & lệ phí địa chính theo biểu mức HĐND tỉnh ban hành';
    feeDetail = 'Công dân nộp phí sau khi hồ sơ được thẩm tra đủ điều kiện và có thông báo thực hiện nghĩa vụ tài chính.';
    result = 'Văn bản xác nhận hiện trạng sử dụng đất / Giấy phép xây dựng / Biên bản thẩm tra hồ sơ địa chính';
    dossierList = [
      {
        stt: 1,
        name: 'Đơn đề nghị xác nhận hiện trạng / Đơn xin cấp phép xây dựng / Đơn đăng ký biến động đất đai theo mẫu',
        original: '01 bản chính',
        copy: '00',
        note: 'Có chữ ký đầy đủ của chủ sử dụng đất/chủ sở hữu tài sản',
      },
      {
        stt: 2,
        name: 'Giấy chứng nhận quyền sử dụng đất, quyền sở hữu nhà ở và tài sản khác gắn liền với đất (Sổ đỏ / Sổ hồng)',
        original: 'Xuất trình',
        copy: '01 bản chụp',
        note: 'Bản chính xuất trình để công chức kiểm tra',
      },
      {
        stt: 3,
        name: 'Bản vẽ trích lục địa chính / Trích đo địa chính thửa đất hoặc Bản vẽ thiết kế xây dựng (nếu xin phép xây dựng)',
        original: '01 bản chính',
        copy: '01 bản',
        note: 'Do đơn vị có tư cách pháp nhân đo đạc thiết kế lập',
      },
      {
        stt: 4,
        name: 'Căn cước công dân / VNeID của người đứng tên hồ sơ',
        original: 'Xuất trình',
        copy: '00',
        note: 'Xác thực chủ thể nộp hồ sơ',
      },
    ];
  }
  // 4. LĨNH VỰC LAO ĐỘNG - THƯƠNG BINH VÀ XÃ HỘI / BẢO TRỢ XÃ HỘI
  else if (catLower.includes('bảo trợ') || catLower.includes('lao động') || catLower.includes('người có công') || titleLower.includes('trợ cấp') || titleLower.includes('khuyết tật') || titleLower.includes('mai táng phí')) {
    duration = '07 đến 10 ngày làm việc kể từ ngày nhận đủ hồ sơ';
    durationDetail = 'Bao gồm thời gian họp Hội đồng xét duyệt trợ cấp xã hội phường và niêm yết công khai kết quả 03 ngày làm việc tại trụ sở UBND.';
    fee = 'Miễn phí hoàn toàn 100%';
    feeDetail = 'Chính sách an sinh xã hội không thu bất kỳ khoản phí, lệ phí nào của nhân dân.';
    result = 'Quyết định hưởng trợ cấp xã hội hàng tháng / Giấy chứng nhận khuyết tật / Hỗ trợ kinh phí mai táng';
    dossierList = [
      {
        stt: 1,
        name: 'Tờ khai thông tin đối tượng đề nghị hưởng trợ cấp xã hội / đề nghị xác định mức độ khuyết tật (theo mẫu)',
        original: '01 bản chính',
        copy: '00',
        note: 'Có chữ ký của đối tượng hoặc người giám hộ hợp pháp',
      },
      {
        stt: 2,
        name: 'Bản sao tóm tắt hồ sơ bệnh án hoặc kết luận giám định y khoa (nếu có đối với người khuyết tật, bệnh hiểm nghèo)',
        original: 'Xuất trình',
        copy: '01 bản chụp',
        note: 'Cung cấp để Hội đồng xem xét đánh giá',
      },
      {
        stt: 3,
        name: 'Trích lục khai tử (đối với thủ tục hỗ trợ chi phí mai táng cho đối tượng bảo trợ xã hội qua đời)',
        original: '01 bản sao',
        copy: '00',
        note: 'Bản sao chứng thực hoặc trích lục bản sao',
      },
      {
        stt: 4,
        name: 'Căn cước công dân / VNeID của đối tượng và người chăm sóc nuôi dưỡng',
        original: 'Xuất trình',
        copy: '00',
        note: 'Đối chiếu thông tin nơi cư trú',
      },
    ];
  }
  // 5. CÁC THỦ TỤC KHÁC
  else {
    dossierList = [
      {
        stt: 1,
        name: 'Đơn / Tờ khai thực hiện thủ tục hành chính theo mẫu quy định của cơ quan Nhà nước',
        original: '01 bản chính',
        copy: '00',
        note: 'Điền đầy đủ các mục thông tin, ký và ghi rõ họ tên',
      },
      {
        stt: 2,
        name: 'Giấy tờ tùy thân (Thẻ Căn cước / CCCD / Hộ chiếu hoặc tài khoản VNeID mức 2)',
        original: 'Xuất trình',
        copy: '00',
        note: 'Kiểm tra thông tin trên Hệ thống Định danh điện tử Quốc gia',
      },
      {
        stt: 3,
        name: 'Các tài liệu, giấy tờ chuyên môn kèm theo theo yêu cầu của Quyết định công bố TTHC',
        original: '01 bản chính',
        copy: '01 bản',
        note: 'Bản sao có chứng thực hoặc kèm bản chính để đối chiếu',
      },
    ];
  }

  // Cách thức nộp hồ sơ
  const submissionMethods: string[] = [
    'Cách 1: Nộp trực tuyến qua Cổng Dịch vụ công Quốc gia (dichvucong.gov.vn) hoặc Hệ thống thông tin giải quyết TTHC cấp tỉnh bằng tài khoản VNeID.',
    'Cách 2: Nộp hồ sơ trực tiếp tại Trung tâm Phục vụ hành chính công phường Trà Câu.',
    'Cách 3: Gửi hồ sơ qua dịch vụ bưu chính công ích (Bưu điện) đến địa chỉ UBND Phường Trà Câu.',
  ];

  // Trình tự giải quyết
  const executionSteps: string[] = [
    'Bước 1: Tiếp nhận hồ sơ: Cá nhân, tổ chức nộp hồ sơ trực tuyến hoặc trực tiếp tại Trung tâm Phục vụ hành chính công phường Trà Câu. Công chức tiếp nhận kiểm tra tính hợp lệ và cấp Giấy tiếp nhận hồ sơ & hẹn trả kết quả.',
    'Bước 2: Xử lý hồ sơ: Công chức chuyên môn thẩm tra tài liệu, phối hợp các bộ phận liên quan xác minh thực tế (nếu có) và lập dự thảo kết quả giải quyết.',
    'Bước 3: Phê duyệt: Lãnh đạo Ủy ban nhân dân phường xem xét, ký duyệt hồ sơ và ký số kết quả điện tử theo thẩm quyền.',
    'Bước 4: Trả kết quả: Trung tâm Phục vụ hành chính công phường Trà Câu nhận kết quả, thu phí lệ phí (nếu có) và trả kết quả bản giấy hoặc bản điện tử qua Cổng DVC cho công dân.',
  ];

  return {
    code: item.code,
    title: item.title,
    category: item.category,
    agency: item.agency,
    level: item.level,
    url: item.url,
    receivingAgency,
    duration,
    durationDetail,
    fee,
    feeDetail,
    dossier: dossierList,
    submissionMethods,
    executionSteps,
    result,
    legalBases,
  };
}
