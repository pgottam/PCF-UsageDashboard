package io.pivotal.tola.cfapi.Usage.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.concurrent.TimeUnit;

public class DateUtils {

    private static final Logger LOG = LoggerFactory.getLogger(DateUtils.class);

    private final String[] START_DATES = new String[] { "01-01", "04-01", "07-01", "10-01"};
    private final String[] END_DATES = new String[] { "03-31", "06-30", "09-30", "12-31" };

    public long getDayInQuarter(int quarter){

        Date currentDate = this.getCurrentDate();
        Date start = this.getStartDateofQuarter(quarter);

        long diffInMillies = currentDate.getTime()-start.getTime();
        if(diffInMillies < 0){
            diffInMillies = 0;
        }
        long diff = TimeUnit.DAYS.convert(diffInMillies, TimeUnit.MILLISECONDS);

        return diff;

    }

    public List<String> getQuartersInCurrentYear(){
        List<String> quarters = new ArrayList<>();
        int year = this.getYear();
        for(int i=0; i < 4; i++) {
            StringBuilder sb = new StringBuilder();
            sb.append(year).append("-Q").append(i+1);
            quarters.add(sb.toString());
        }
        return quarters;
    }

    public List<String> getElapsedQuartersInCurrentYear(){

        List<String> quarters = new ArrayList<String>();

        int currentYear = getYear();
        int currentQuarter = getQuarter(currentYear, this.getCurrentDate());

        int count = 0;

        while(count < 4) {

            quarters.add(currentYear + "-Q" + currentQuarter);

            if (currentQuarter == 1) {
               break;
            } else{
                currentQuarter --;
            }

            count ++;

        }

        return quarters;
    }

    public List<String> getPastQuarters(int noOfQuarters){
        return this.getPastQuarters(noOfQuarters, this.getCurrentDate());
    }

    public List<String> getPastQuarters(int noOfQuarters, Date d){

        List<String> quarters = new ArrayList<String>();

        int currentYear = getYear();
        int currentQuarter = getQuarter(currentYear, d);

        int count = 0;

        while(count < noOfQuarters) {

            quarters.add(currentYear + "-Q" + currentQuarter);

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
        c.set(Calendar.HOUR_OF_DAY, 0);
        c.set(Calendar.MINUTE, 0);
        c.set(Calendar.SECOND, 0);
        c.set(Calendar.MILLISECOND, 0);
        return c.getTime();
    }

    public Date getStartDateofQuarter(int quarter){

        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
        Date start = null;
        try {
            start = sdf.parse(getYear() + "-" + START_DATES[quarter - 1]);
        }catch(ParseException pe){
            LOG.error("Parsing Exception");
        }
        return start;
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
                LOG.error("Parsing Exception");
            }

        }

        return quarter;
    }
}
