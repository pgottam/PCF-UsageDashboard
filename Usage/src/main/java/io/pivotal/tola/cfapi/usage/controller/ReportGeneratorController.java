package io.pivotal.tola.cfapi.usage.controller;

import io.pivotal.tola.cfapi.usage.model.*;
import io.pivotal.tola.cfapi.usage.service.UsageService;
import io.pivotal.tola.cfapi.usage.utils.DateUtils;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import javax.servlet.http.HttpServletResponse;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
public class ReportGeneratorController {

    @Autowired
    UsageService usageService;

    @GetMapping("/report/{foundation}/appusage")
    public void appUsage(@PathVariable("foundation") String foundation, @RequestParam("startdate") String start,
                         @RequestParam(value = "enddate", required = false) String end,
                         HttpServletResponse response) throws Exception {

        Date startDate = null, endDate = null;

        DateUtils dt = new DateUtils();
        if (start != null) {
            startDate = dt.getDayStart(start);
        }

        if (end != null) {
            endDate = dt.getDayEnd(end);
        } else {
            endDate = dt.getDayEnd(start);
        }

        String fileName = foundation + "_appusage" + "_" + dt.converttoyyyyMMdd(startDate) + "_" + dt.converttoyyyyMMdd(endDate) + ".xlsx";

        final Date sd = startDate;
        final Date ed = endDate;

        List<Organization> orgs = usageService.getOrgs(foundation);

        final XSSFWorkbook workbook = new XSSFWorkbook();
        Map<String, CellStyle> styles = createStyles(workbook);

        orgs.forEach(org -> {
            OrgUsage orgUsage = usageService.appUsage(foundation, org.getGuid(), sd, ed);

            // create a new Excel sheet
            XSSFSheet sheet = workbook.createSheet(org.getName());

            PrintSetup printSetup = sheet.getPrintSetup();
            printSetup.setLandscape(true);
            sheet.setFitToPage(true);
            sheet.setHorizontallyCenter(true);

            Row titleRow = sheet.createRow(0);
            titleRow.setHeightInPoints(45);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("Orgs");
            titleCell.setCellStyle(styles.get("title"));
            sheet.addMergedRegion(CellRangeAddress.valueOf("$A$1:$E$1"));


            Row headerRow = sheet.createRow(1);
            headerRow.createCell(0).setCellValue("Org Name");
            headerRow.createCell(1).setCellValue("Total Apps");
            headerRow.createCell(2).setCellValue("Total Gb per Ais");
            headerRow.createCell(3).setCellValue("Avg AI Count");

            Row dataRow = sheet.createRow(2);
            dataRow.createCell(0).setCellValue(org.getName());
            dataRow.createCell(1).setCellValue(orgUsage.getTotalApps());
            dataRow.createCell(2).setCellValue(orgUsage.getTotalGbPerAis());
            dataRow.createCell(3).setCellValue(orgUsage.getAvgAICount());

            sheet.setRowBreak(3);
            sheet.setRowBreak(4);

            titleRow = sheet.createRow(5);
            titleRow.setHeightInPoints(45);
            titleCell = titleRow.createCell(0);
            titleCell.setCellValue("Spaces");
            titleCell.setCellStyle(styles.get("title"));
            sheet.addMergedRegion(CellRangeAddress.valueOf("$A$6:$E$6"));

            headerRow = sheet.createRow(6);
            headerRow.createCell(0).setCellValue("Space Name");
            headerRow.createCell(1).setCellValue("Total Apps");
            headerRow.createCell(2).setCellValue("Total Gb per Ais");
            headerRow.createCell(3).setCellValue("Avg AI Count");

            int i = 7;
            for (Map.Entry<String, SpaceUsage> entry : orgUsage.getSpaceUsage().entrySet()) {

                dataRow = sheet.createRow(i);
                dataRow.createCell(0).setCellValue(entry.getValue().getSpaceName());
                dataRow.createCell(1).setCellValue(entry.getValue().getTotalApps());
                dataRow.createCell(2).setCellValue(entry.getValue().getTotalGbPerAis());
                dataRow.createCell(3).setCellValue(entry.getValue().getAvgAICount());
                i++;
            }


            sheet.setRowBreak(i++);
            sheet.setRowBreak(i++);

            titleRow = sheet.createRow(i++);
            titleRow.setHeightInPoints(45);
            titleCell = titleRow.createCell(0);
            titleCell.setCellValue("Applications");
            titleCell.setCellStyle(styles.get("title"));

            StringBuilder sb = new StringBuilder();
            sb.append("$A$").append(i).append(":$E$").append(i);
            sheet.addMergedRegion(CellRangeAddress.valueOf(sb.toString()));

            headerRow = sheet.createRow(i++);
            headerRow.createCell(0).setCellValue("Application Name");
            headerRow.createCell(1).setCellValue("Space Name");
            headerRow.createCell(2).setCellValue("Total Gb per Ais");
            headerRow.createCell(3).setCellValue("Avg AI Count");

            for (Map.Entry<String, AUsage> entry : orgUsage.getAUsage().entrySet()) {

                dataRow = sheet.createRow(i);
                dataRow.createCell(0).setCellValue(entry.getValue().getAppName());
                dataRow.createCell(1).setCellValue(entry.getValue().getSpaceName());
                dataRow.createCell(2).setCellValue(entry.getValue().getTotalGbPerAis());
                dataRow.createCell(3).setCellValue(entry.getValue().getAvgAICount());
                i++;
            }

        });

        response.setHeader("Content-disposition", "attachment; filename=" + fileName);
        workbook.write(response.getOutputStream());
    }

    @GetMapping("/report/{foundation}/svcusage")
    public void svcUsage(@PathVariable("foundation") String foundation, @RequestParam("startdate") String start,
                         @RequestParam(value = "enddate", required = false) String end,
                         HttpServletResponse response) throws Exception {

        Date startDate = null, endDate = null;

        DateUtils dt = new DateUtils();
        if (start != null) {
            startDate = dt.getDayStart(start);
        }

        if (end != null) {
            endDate = dt.getDayEnd(end);
        } else {
            endDate = dt.getDayEnd(start);
        }

        String fileName = foundation + "_svcusage" + "_" + dt.converttoyyyyMMdd(startDate) + "_" + dt.converttoyyyyMMdd(endDate) + ".xlsx";

        final Date sd = startDate;
        final Date ed = endDate;

        List<Organization> orgs = usageService.getOrgs(foundation);

        final XSSFWorkbook workbook = new XSSFWorkbook();
        Map<String, CellStyle> styles = createStyles(workbook);

        orgs.forEach(org -> {
            SIUsage siUsage = usageService.svcUsage(foundation, org.getGuid(), sd, ed);

            // create a new Excel sheet
            XSSFSheet sheet = workbook.createSheet(org.getName());

            PrintSetup printSetup = sheet.getPrintSetup();
            printSetup.setLandscape(true);
            sheet.setFitToPage(true);
            sheet.setHorizontallyCenter(true);

            Row titleRow = sheet.createRow(0);
            titleRow.setHeightInPoints(45);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("Orgs");
            titleCell.setCellStyle(styles.get("title"));
            sheet.addMergedRegion(CellRangeAddress.valueOf("$A$1:$D$1"));


            Row headerRow = sheet.createRow(1);
            headerRow.createCell(0).setCellValue("Org Name");
            headerRow.createCell(1).setCellValue("Total Services");
            headerRow.createCell(2).setCellValue("Total Sis");
            headerRow.createCell(3).setCellValue("Avg SI Count");

            Row dataRow = sheet.createRow(2);
            dataRow.createCell(0).setCellValue(org.getName());
            dataRow.createCell(1).setCellValue(siUsage.getTotalSvcs());
            dataRow.createCell(2).setCellValue(siUsage.getTotalSis());
            dataRow.createCell(3).setCellValue(siUsage.getAvgSICount());

            sheet.setRowBreak(3);
            sheet.setRowBreak(4);

            titleRow = sheet.createRow(5);
            titleRow.setHeightInPoints(45);
            titleCell = titleRow.createCell(0);
            titleCell.setCellValue("Spaces");
            titleCell.setCellStyle(styles.get("title"));
            sheet.addMergedRegion(CellRangeAddress.valueOf("$A$6:$D$6"));

            headerRow = sheet.createRow(6);
            headerRow.createCell(0).setCellValue("Space Name");
            headerRow.createCell(1).setCellValue("Total Services");
            headerRow.createCell(2).setCellValue("Total Sis");
            headerRow.createCell(3).setCellValue("Avg SI Count");

            int i = 7;
            for (Map.Entry<String, SISpaceUsage> entry : siUsage.getSiSpaceUsage().entrySet()) {

                dataRow = sheet.createRow(i);
                dataRow.createCell(0).setCellValue(entry.getValue().getSpaceName());
                dataRow.createCell(1).setCellValue(entry.getValue().getTotalSvcs());
                dataRow.createCell(2).setCellValue(entry.getValue().getTotalSis());
                dataRow.createCell(3).setCellValue(entry.getValue().getAvgSICount());
                i++;
            }


            sheet.setRowBreak(i++);
            sheet.setRowBreak(i++);

            titleRow = sheet.createRow(i++);
            titleRow.setHeightInPoints(45);
            titleCell = titleRow.createCell(0);
            titleCell.setCellValue("Applications");
            titleCell.setCellStyle(styles.get("title"));

            StringBuilder sb = new StringBuilder();
            sb.append("$A$").append(i).append(":$D$").append(i);
            sheet.addMergedRegion(CellRangeAddress.valueOf(sb.toString()));

            headerRow = sheet.createRow(i++);
            headerRow.createCell(0).setCellValue("Service Name");
            headerRow.createCell(1).setCellValue("Space Name");
            headerRow.createCell(2).setCellValue("Service Instance Name");
            headerRow.createCell(3).setCellValue("Avg SI Count");

            for (Map.Entry<String, ServiceInstanceUsage> entry : siUsage.getServiceInstanceUsage().entrySet()) {

                dataRow = sheet.createRow(i);
                dataRow.createCell(0).setCellValue(entry.getValue().getServiceName());
                dataRow.createCell(1).setCellValue(entry.getValue().getSpaceName());
                dataRow.createCell(2).setCellValue(entry.getValue().getServiceInstanceName());
                dataRow.createCell(3).setCellValue(entry.getValue().getAvgSICount());
                i++;
            }

        });

        response.setHeader("Content-disposition", "attachment; filename=" + fileName);
        workbook.write(response.getOutputStream());
    }


    private Map<String, CellStyle> createStyles(Workbook wb) {
        Map<String, CellStyle> styles = new HashMap<>();
        CellStyle style;
        Font titleFont = wb.createFont();
        titleFont.setFontHeightInPoints((short) 18);
        titleFont.setBold(true);
        style = wb.createCellStyle();
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setFont(titleFont);
        styles.put("title", style);
        return styles;
    }

}
