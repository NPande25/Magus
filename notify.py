# Script to send out notifications upon room entry

from email.message import EmailMessage
import ssl
import smtplib
import datetime
import time
import requests
from bs4 import BeautifulSoup


def send_email(sender, password, to, subject, body):
    # Create email message with info
    em = EmailMessage()
    em['From'] = sender
    em['To'] = to
    em['subject'] = subject
    em.set_content(body)

    context = ssl.create_default_context()

    try:
        with smtplib.SMTP_SSL('smtp.gmail.com', 465, context=context) as smtp:
            smtp.login(sender, password)
            smtp.sendmail(sender, to, em.as_string())

        return True;
    except smtplib.SMTPException as e:
        error_message = str(e)
        print(error_message)
        return False;


def get_word_and_definition():
    # request html from the url
    url = "https://www.merriam-webster.com/word-of-the-day"
    r = requests.get(url)

    # parse the html
    soup = BeautifulSoup(r.content, 'html.parser')

    word = soup.find('h2', class_='word-header-txt').text  # find word of the day

    definition = soup.find('div', class_='wod-definition-container').find('p').text

    return word, definition


def schedule_email_sending(day):
    # Set the date and time you want to send the email
    send_time = datetime.datetime(2023, 11, day, 13, 43, 40)  # Year, Month, Day, Hour, Minute, Second

    # Calculate the time remaining until the send_time
    current_time = datetime.datetime.now()
    time_diff = send_time - current_time
    time_seconds = time_diff.total_seconds()

    # Sleep until the specified time
    if time_seconds > 0:
        print("Sleeping until " + str(send_time) + ".")
        minutes = str(round(time_diff.total_seconds() // 60))
        seconds = str(round(time_diff.total_seconds() % 60))
        print("Message will be sent in " + minutes + " minutes and " + seconds + " seconds.")
        time.sleep(time_seconds)
        return True
    else:
        return False


# for day in range(9, 14):
#     if schedule_email_sending(day):

email_sender = 'nikhil.a.pande@gmail.com'
email_password = 'bjdp csou hiov gyaz'
email_to = '6178798589@vzwpix.com'
subject1 = "Word of the day!"
# subject2 = ""

word, definition = get_word_and_definition()
body1 = str("The Merriam-Webster word of the day is: " + word + "\n\n" + definition)
# body2 = str(definition)
send_email(email_sender, email_password, email_to, subject1, body1)
# send_email(email_sender, email_password, email_to, subject2, body2)

print("Message sent!")

# else:
#     print('Scheduled time has already passed.')
#     print("It's currently " + str(datetime.datetime.now()))

