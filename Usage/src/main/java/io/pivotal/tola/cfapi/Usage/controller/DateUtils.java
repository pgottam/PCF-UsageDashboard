package io.pivotal.tola.cfapi.Usage.controller;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

public class DateUtils {

    private final String[] START_DATES = new String[] { "01-01", "04-01", "07-01", "10-01"};
    private final String[] END_DATES = new String[] { "03-31", "06-30", "09-30", "12-31" };

    public List<String> getPastQuarters(int noOfQuarters){

        List<String> quarters = new ArrayList<String>();

        int currentYear = getYear();
        int currentQuarter = getQuarter(currentYear, getCurrentDate());

        int count = 0;

        while(count < noOfQuarters) {

            quarters.add(currentYear + "-" + currentQuarter);

            if (currentQuarter == 1) {
                currentQuarter = 4;
                currentYear --;
            } else{
                currentQuarter --;
            }

            count ++;

        }

        return quarters;

    }

    public int getYear(){

        Calendar c = Calendar.getInstance();
       return c.get(Calendar.YEAR);
    }

    public Date getCurrentDate(){

        Calendar c = Calendar.getInstance();
        c.set(Calendar.HOUR, 0);
        c.set(Calendar.MINUTE, 0);
        c.set(Calendar.SECOND, 0);
        c.set(Calendar.MILLISECOND, 0);
        return c.getTime();
    }

    public int getQuarter(int year , Date d){

        int quarter = 0;

        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
        Date start, end;

        for(int i=0; i<START_DATES.length; i++){

            try {
                start = sdf.parse(year + "-" + START_DATES[i]);
                end = sdf.parse(year + "-" + END_DATES[i]);

                if (start.compareTo(d) * d.compareTo(end) >= 0) {
                    quarter = i + 1;
                    break;
                }
            }
            catch(ParseException pe){
                System.out.println("Parsing Exception");
            }

        }

        return quarter;
    }

}
